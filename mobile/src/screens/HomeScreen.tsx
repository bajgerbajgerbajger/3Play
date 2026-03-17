import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import api from '../api/axios';

const HomeScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await api.get('/videos');
      setVideos(response.data.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  };

  const renderVideo = ({ item }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => navigation.navigate('Video', { videoId: item._id })}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/320x180' }}
          style={styles.thumbnail}
        />
        <Text style={styles.duration}>
          {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
        </Text>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.channel}>{item.owner?.name || 'Unknown Channel'}</Text>
        <Text style={styles.views}>
          {item.views} zobrazení • před {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'nedávno'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff0000"
          />
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  list: {
    paddingBottom: 20,
  },
  videoCard: {
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoInfo: {
    paddingTop: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  channel: {
    color: '#aaa',
    fontSize: 12,
  },
  views: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
});

export default HomeScreen;