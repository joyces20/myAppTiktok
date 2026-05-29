import React, { useCallback, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import VideoCard from './VideoCard';
import { useFeedStore } from '../../store/feedStore';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const FeedList = ({ videos, onEndReached, loadingMore }) => {
  const { setCurrentIndex, setIsPlaying } = useFeedStore();
  const visibleIndexRef = useRef(0);

  // Détecte quelle vidéo est visible à l'écran
  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== visibleIndexRef.current) {
        visibleIndexRef.current = newIndex;
        setCurrentIndex(newIndex);
        setIsPlaying(true); // reprendre la lecture automatiquement
      }
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const renderItem = useCallback(
    ({ item, index }) => (
      <VideoCard
        video={item}
        index={index}
        isVisible={index === visibleIndexRef.current}
      />
    ),
    [],
  );

  const keyExtractor = useCallback(item => item.id, []);

  const ListFooter = () =>
    loadingMore ? (
      <View style={styles.footer}>
        <ActivityIndicator color="#fff" />
      </View>
    ) : null;

  return (
    <FlashList
      data={videos}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={SCREEN_HEIGHT}
      pagingEnabled={true}
      showsVerticalScrollIndicator={false}
      snapToInterval={SCREEN_HEIGHT}
      snapToAlignment="start"
      decelerationRate="fast"
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooter}
      removeClippedSubviews={true}
    />
  );
};

const styles = StyleSheet.create({
  footer: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default FeedList;