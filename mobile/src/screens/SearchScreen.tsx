import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import api from '../api/axios';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    try {
      const response = await api.get(`/videos/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
  };

  const renderVideo = ({ item }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => navigation.navigate('Video', { videoId: item._id })}
    >
      <Image
        source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/320x180' }}
        style={styles.thumbnail}
      />
      <View style={styles.videoInfo}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.channel}>{item.owner?.name || 'Unknown'}</Text>
        <Text style={styles.views}>{item.views} zobrazení</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Hledat videa..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Hledat</Text>
        </TouchableOpacity>
      </View>

      {hasSearched && results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Žádné výsledky</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderVideo}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#ff0000',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  videoCard: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  thumbnail: {
    width: 160,
    height: 90,
    borderRadius: 8,
  },
  videoInfo: {
    flex: 1,
    justifyContent: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});

export default SearchScreen;