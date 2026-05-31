import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import { useFeedStore } from '../../store/feedStore';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const VideoPlayer = ({ video, index, isVisible }) => {
  const videoRef = useRef(null);
  const { isPlaying, currentIndex, togglePlaying } = useFeedStore();
  const [buffering, setBuffering] = React.useState(false);

  // Ce joueur est actif si c'est la vidéo visible à l'écran
  const isActive = isVisible && index === currentIndex;

  const handleBuffer = useCallback(({ isBuffering }) => {
    setBuffering(isBuffering);
  }, []);

  const handleError = useCallback(err => {
    console.error('[VideoPlayer] error:', err);
  }, []);

  const handleTap = useCallback(() => {
    togglePlaying();
  }, [togglePlaying]);

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        <Video
          ref={videoRef}
          source={{ uri: video.video_url }}
          style={styles.video}
          resizeMode="cover"
          repeat={true}
          paused={!isActive || !isPlaying}
          onBuffer={handleBuffer}
          onError={handleError}
          bufferConfig={{
            minBufferMs: 1500,
            maxBufferMs: 5000,
            bufferForPlaybackMs: 1000,
            bufferForPlaybackAfterRebufferMs: 2000,
          }}
          ignoreSilentSwitch="ignore"
          playInBackground={false}
          playWhenInactive={false}
        />

        {/* Indicateur de chargement */}
        {buffering && isActive && (
          <View style={styles.bufferingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {/* Indicateur pause */}
        {!isPlaying && isActive && (
          <View style={styles.pauseOverlay} pointerEvents="none">
            <View style={styles.pauseIcon}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 6,
    opacity: 0.7,
  },
  pauseBar: {
    width: 6,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
});

export default React.memo(VideoPlayer);