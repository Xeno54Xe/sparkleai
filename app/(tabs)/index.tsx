import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Stock database - will be replaced with backend data later
  const allStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'INFY', name: 'Infosys Ltd.' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.' },
    { symbol: 'ITC', name: 'ITC Ltd.' },
    { symbol: 'WIPRO', name: 'Wipro Ltd.' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.' },
  ];

  // Filter stocks based on search query
  const filteredStocks = allStocks.filter(stock => 
    stock.symbol.toUpperCase().includes(searchQuery.toUpperCase()) ||
    stock.name.toUpperCase().includes(searchQuery.toUpperCase())
  );

  const handleSearch = (stock: string) => {
    setSearchQuery(stock);
    setShowDropdown(false);
    // Navigate to analysis screen with stock name
    router.push(`/explore?stock=${stock}`);
  };

  const handleInputChange = (text: string) => {
    setSearchQuery(text.toUpperCase());
    setShowDropdown(text.length > 0);
  };

  const selectStock = (symbol: string) => {
    setSearchQuery(symbol);
    setShowDropdown(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{
        backgroundColor: '#5B21B6',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        padding: 32,
        paddingTop: 60,
        paddingBottom: showDropdown ? 20 : 32
      }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
          स्वागत है!
        </Text>
        <Text style={{ fontSize: 24, fontWeight: '600', color: 'white', marginBottom: 8 }}>
          Welcome to Sparkle AI
        </Text>
        <Text style={{ fontSize: 16, color: '#E9D5FF', marginBottom: 24 }}>
          India's smartest stock advisor powered by AI
        </Text>
        
        {/* Search Bar with Dropdown */}
        <View style={{ position: 'relative', zIndex: 1000 }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🔍</Text>
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 18,
                  fontWeight: '500',
                  color: '#1F2937'
                }}
                placeholder="Search any Indian stock..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleInputChange}
                autoCapitalize="characters"
                onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setSearchQuery('');
                  setShowDropdown(false);
                }}>
                  <Text style={{ fontSize: 18, color: '#9CA3AF', paddingLeft: 8 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => handleSearch(searchQuery)}
                style={{
                  backgroundColor: '#5B21B6',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  Analyze {searchQuery}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Dropdown Results */}
          {showDropdown && filteredStocks.length > 0 && (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              marginTop: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
              maxHeight: 300
            }}>
              <ScrollView nestedScrollEnabled={true}>
                {filteredStocks.map((stock, index) => (
                  <TouchableOpacity
                    key={stock.symbol}
                    onPress={() => selectStock(stock.symbol)}
                    style={{
                      padding: 16,
                      borderBottomWidth: index < filteredStocks.length - 1 ? 1 : 0,
                      borderBottomColor: '#F3F4F6'
                    }}
                  >
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: 'bold', 
                      color: '#1F2937',
                      marginBottom: 2
                    }}>
                      {stock.symbol}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#6B7280' }}>
                      {stock.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* No results message */}
          {showDropdown && searchQuery.length > 0 && filteredStocks.length === 0 && (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              marginTop: 8,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 16, color: '#6B7280' }}>
                No stocks found for "{searchQuery}"
              </Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
                Try searching for: RELIANCE, TCS, INFY
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content Section */}
      <View style={{ padding: 20 }}>
        {/* Popular Searches */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>📈</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
              Popular Searches
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {allStocks.slice(0, 8).map((stock) => (
              <TouchableOpacity
                key={stock.symbol}
                onPress={() => handleSearch(stock.symbol)}
                style={{
                  backgroundColor: '#EDE9FE',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                  marginRight: 8,
                  marginBottom: 8
                }}
              >
                <Text style={{ color: '#5B21B6', fontWeight: '600' }}>
                  {stock.symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Cards */}
        <View style={{ flexDirection: 'row', marginBottom: 16, justifyContent: 'space-between' }}>
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            marginRight: 8
          }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🎯</Text>
            <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500', textAlign: 'center' }}>
              AI-Powered
            </Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            marginRight: 8
          }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📊</Text>
            <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500', textAlign: 'center' }}>
              Real Data
            </Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2
          }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🇮🇳</Text>
            <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500', textAlign: 'center' }}>
              Indian Markets
            </Text>
          </View>
        </View>

        {/* How it works */}
        <View style={{
          backgroundColor: '#F3E8FF',
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: '#DDD6FE'
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 }}>
            How Sparkle AI Works
          </Text>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{
                width: 24,
                height: 24,
                backgroundColor: '#5B21B6',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>1</Text>
              </View>
              <Text style={{ flex: 1, color: '#374151', fontSize: 14, lineHeight: 20 }}>
                Search for any NSE/BSE listed stock
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{
                width: 24,
                height: 24,
                backgroundColor: '#5B21B6',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>2</Text>
              </View>
              <Text style={{ flex: 1, color: '#374151', fontSize: 14, lineHeight: 20 }}>
                AI analyzes sentiment, financials, and trends
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{
                width: 24,
                height: 24,
                backgroundColor: '#5B21B6',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>3</Text>
              </View>
              <Text style={{ flex: 1, color: '#374151', fontSize: 14, lineHeight: 20 }}>
                Get clear Buy/Sell/Hold advice with confidence score
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}