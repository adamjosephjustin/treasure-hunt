/**
 * useVoiceChat.js — WebRTC peer-to-peer voice chat.
 *
 * Uses Firebase Firestore as the signaling server.
 * Full mesh topology: each player connects to every other player.
 * For 4 players this means 6 peer connections total (3 per player).
 * Audio flows directly between browsers — zero cost.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  db,
  doc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getUid,
} from '../utils/firebase';

// STUN alone frequently fails to establish a peer connection when either
// side is on a cellular network (carrier-grade NAT is common on mobile
// data) or a locked-down WiFi — the call needs a TURN relay to fall back
// on. openrelay.metered.ca publishes these credentials as a free, public
// relay for exactly this use case. It's fine for a friends' game, but has
// no uptime guarantee — for guaranteed reliability, swap in your own
// TURN credentials (e.g. Twilio NTS, Metered.ca's paid tier, or a
// self-hosted coturn instance) here.
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.relay.metered.ca:80' },
  {
    urls: 'turn:global.relay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:global.relay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:global.relay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

export function useVoiceChat(roomId, players) {
  const [isInVoice, setIsInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingPeers, setSpeakingPeers] = useState(new Set());
  const [voiceError, setVoiceError] = useState(null);

  const localStreamRef = useRef(null);
  const connectionsRef = useRef({}); // { peerId: RTCPeerConnection }
  const audioElementsRef = useRef({}); // { peerId: HTMLAudioElement }
  const analysersRef = useRef({});
  const signalUnsubRef = useRef(null);
  const animFrameRef = useRef(null);

  const uid = getUid();

  // Clean up on unmount
  useEffect(() => {
    return () => _cleanup();
  }, []);

  const _cleanup = () => {
    // Stop local stream
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    // Close all peer connections
    Object.values(connectionsRef.current).forEach((pc) => pc.close());
    connectionsRef.current = {};

    // Remove audio elements
    Object.values(audioElementsRef.current).forEach((el) => el.remove());
    audioElementsRef.current = {};

    // Cancel animation frame
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // Unsubscribe from signals
    signalUnsubRef.current?.();
  };

  /** Join voice chat */
  const joinVoice = useCallback(async () => {
    try {
      setVoiceError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      setIsInVoice(true);

      // Announce presence in signaling collection
      await setDoc(
        doc(db, 'thurup_rooms', roomId, 'signals', `presence_${uid}`),
        { uid, type: 'presence', timestamp: new Date().toISOString() }
      );

      // Listen for signals from other players
      _listenForSignals();

      // Initiate connections to players who are already present
      const otherPlayers = (players || []).filter((p) => p.uid !== uid);
      for (const p of otherPlayers) {
        // Only the "lower" UID initiates to avoid double connections
        if (uid < p.uid) {
          await _createOffer(p.uid);
        }
      }

      // Start speaking detection
      _startSpeakingDetection();
    } catch (err) {
      console.error('Voice chat error:', err);
      setVoiceError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied.'
          : 'Could not start voice chat.'
      );
    }
  }, [roomId, players, uid]);

  /** Leave voice chat */
  const leaveVoice = useCallback(async () => {
    _cleanup();
    setIsInVoice(false);
    setSpeakingPeers(new Set());

    // Remove presence
    try {
      await deleteDoc(doc(db, 'thurup_rooms', roomId, 'signals', `presence_${uid}`));
    } catch (e) {}
  }, [roomId, uid]);

  /** Toggle microphone mute */
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getAudioTracks();
      tracks.forEach((t) => { t.enabled = !t.enabled; });
      setIsMuted((prev) => !prev);
    }
  }, []);

  // ─── WebRTC internals ──────────────────────────────────

  const _getOrCreateConnection = (peerId) => {
    if (connectionsRef.current[peerId]) return connectionsRef.current[peerId];

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    connectionsRef.current[peerId] = pc;

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.autoplay = true;
      audioElementsRef.current[peerId] = audio;

      // Set up analyser for speaking detection
      try {
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(event.streams[0]);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analysersRef.current[peerId] = analyser;
      } catch (e) {}
    };

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(collection(db, 'thurup_rooms', roomId, 'signals'), {
          type: 'ice',
          from: uid,
          to: peerId,
          candidate: event.candidate.toJSON(),
          timestamp: new Date().toISOString(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        // Peer disconnected
        pc.close();
        delete connectionsRef.current[peerId];
        audioElementsRef.current[peerId]?.remove();
        delete audioElementsRef.current[peerId];
      }
    };

    return pc;
  };

  const _createOffer = async (peerId) => {
    const pc = _getOrCreateConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await addDoc(collection(db, 'thurup_rooms', roomId, 'signals'), {
      type: 'offer',
      from: uid,
      to: peerId,
      sdp: offer.sdp,
      sdpType: offer.type,
      timestamp: new Date().toISOString(),
    });
  };

  const _handleOffer = async (fromUid, sdp, sdpType) => {
    const pc = _getOrCreateConnection(fromUid);
    await pc.setRemoteDescription(new RTCSessionDescription({ type: sdpType, sdp }));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await addDoc(collection(db, 'thurup_rooms', roomId, 'signals'), {
      type: 'answer',
      from: uid,
      to: fromUid,
      sdp: answer.sdp,
      sdpType: answer.type,
      timestamp: new Date().toISOString(),
    });
  };

  const _handleAnswer = async (fromUid, sdp, sdpType) => {
    const pc = connectionsRef.current[fromUid];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription({ type: sdpType, sdp }));
    }
  };

  const _handleIceCandidate = async (fromUid, candidate) => {
    const pc = connectionsRef.current[fromUid];
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {}
    }
  };

  const _listenForSignals = () => {
    const q = query(collection(db, 'thurup_rooms', roomId, 'signals'));

    signalUnsubRef.current = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type !== 'added') return;
        const data = change.doc.data();
        if (data.to !== uid) return;

        switch (data.type) {
          case 'offer':
            _handleOffer(data.from, data.sdp, data.sdpType);
            break;
          case 'answer':
            _handleAnswer(data.from, data.sdp, data.sdpType);
            break;
          case 'ice':
            _handleIceCandidate(data.from, data.candidate);
            break;
        }
      });

      // Check for new presence signals to initiate connections
      snap.docChanges().forEach((change) => {
        if (change.type !== 'added') return;
        const data = change.doc.data();
        if (data.type === 'presence' && data.uid !== uid && uid < data.uid) {
          _createOffer(data.uid);
        }
      });
    });
  };

  // ─── Speaking detection ────────────────────────────────

  const _startSpeakingDetection = () => {
    const detect = () => {
      const speaking = new Set();
      for (const [peerId, analyser] of Object.entries(analysersRef.current)) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg > 15) speaking.add(peerId);
      }
      setSpeakingPeers(speaking);
      animFrameRef.current = requestAnimationFrame(detect);
    };
    animFrameRef.current = requestAnimationFrame(detect);
  };

  return {
    isInVoice,
    isMuted,
    speakingPeers,
    voiceError,
    joinVoice,
    leaveVoice,
    toggleMute,
  };
}
