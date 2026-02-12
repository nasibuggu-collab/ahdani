'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Send, Heart, MessageCircle, UserPlus, Search, Image, Video, X, Home, Users, User, LogOut, Plus, Bookmark, MoreHorizontal } from 'lucide-react';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  friends: string[];
}

interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[];
  comments: Comment[];
  timestamp: number;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

interface Chat {
  userId: string;
  username: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount: number;
}

const SocialApp: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });

  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<'home' | 'friends' | 'messages' | 'profile'>('home');
  const [showNewPost, setShowNewPost] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  // New Post State
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Load data from persistent storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load users
        const usersData = await window.storage.get('app_users', true);
        if (usersData) {
          setUsers(JSON.parse(usersData.value));
        }

        // Load posts
        const postsData = await window.storage.get('app_posts', true);
        if (postsData) {
          setPosts(JSON.parse(postsData.value));
        }

        // Load messages
        const messagesData = await window.storage.get('app_messages', true);
        if (messagesData) {
          setMessages(JSON.parse(messagesData.value));
        }

        // Load current user
        const currentUserData = await window.storage.get('app_current_user', false);
        if (currentUserData) {
          setCurrentUser(JSON.parse(currentUserData.value));
        }
      } catch (error) {
        console.log('İlk yükleme, veri yok');
      }
    };

    loadData();
  }, []);

  // Save data to persistent storage
  useEffect(() => {
    if (users.length > 0) {
      window.storage.set('app_users', JSON.stringify(users), true).catch(console.error);
    }
  }, [users]);

  useEffect(() => {
    if (posts.length > 0) {
      window.storage.set('app_posts', JSON.stringify(posts), true).catch(console.error);
    }
  }, [posts]);

  useEffect(() => {
    if (messages.length > 0) {
      window.storage.set('app_messages', JSON.stringify(messages), true).catch(console.error);
    }
  }, [messages]);

  useEffect(() => {
    if (currentUser) {
      window.storage.set('app_current_user', JSON.stringify(currentUser), false).catch(console.error);
    }
  }, [currentUser]);

  // Auth Functions
  const handleRegister = () => {
    if (!authForm.username || !authForm.email || !authForm.password) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    if (users.some(u => u.email === authForm.email)) {
      alert('Bu email zaten kullanılıyor!');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: authForm.username,
      email: authForm.email,
      password: authForm.password,
      friends: []
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    setAuthForm({ username: '', email: '', password: '' });
  };

  const handleLogin = () => {
    const user = users.find(u => u.email === authForm.email && u.password === authForm.password);
    if (user) {
      setCurrentUser(user);
      setAuthForm({ username: '', email: '', password: '' });
    } else {
      alert('Email veya şifre hatalı!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    window.storage.delete('app_current_user', false).catch(console.error);
    setActiveTab('home');
  };

  // File Upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Dosya boyutu 15MB\'dan küçük olmalıdır!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      setNewPostMedia({ url, type });
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Profil resmi 5MB\'dan küçük olmalıdır!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const updatedUser = { ...currentUser, avatar: url };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    };
    reader.readAsDataURL(file);
  };

  // Post Functions
  const handleCreatePost = () => {
    if (!currentUser) return;
    if (!newPostContent.trim() && !newPostMedia) {
      alert('Lütfen içerik ekleyin!');
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      content: newPostContent,
      mediaUrl: newPostMedia?.url,
      mediaType: newPostMedia?.type,
      likes: [],
      comments: [],
      timestamp: Date.now()
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostMedia(null);
    setShowNewPost(false);
  };

  const handleLikePost = (postId: string) => {
    if (!currentUser) return;
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const likes = post.likes.includes(currentUser.id)
          ? post.likes.filter(id => id !== currentUser.id)
          : [...post.likes, currentUser.id];
        return { ...post, likes };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string, content: string) => {
    if (!currentUser) return;
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: Date.now().toString(),
          userId: currentUser.id,
          username: currentUser.username,
          content,
          timestamp: Date.now()
        };
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    }));
  };

  // Friend Functions
  const handleAddFriend = (userId: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, friends: [...currentUser.friends, userId] };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const handleRemoveFriend = (userId: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, friends: currentUser.friends.filter(id => id !== userId) };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  // Message Functions
  const handleSendMessage = () => {
    if (!currentUser || !activeChat || !messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: activeChat,
      content: messageInput,
      timestamp: Date.now(),
      read: false
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  // Get chats
  const getChats = (): Chat[] => {
    if (!currentUser) return [];

    const chatMap = new Map<string, Chat>();

    currentUser.friends.forEach(friendId => {
      const friend = users.find(u => u.id === friendId);
      if (friend) {
        const userMessages = messages.filter(
          m => (m.senderId === currentUser.id && m.receiverId === friendId) ||
               (m.senderId === friendId && m.receiverId === currentUser.id)
        ).sort((a, b) => b.timestamp - a.timestamp);

        const unreadCount = messages.filter(
          m => m.senderId === friendId && m.receiverId === currentUser.id && !m.read
        ).length;

        chatMap.set(friendId, {
          userId: friendId,
          username: friend.username,
          avatar: friend.avatar,
          lastMessage: userMessages[0]?.content,
          unreadCount
        });
      }
    });

    return Array.from(chatMap.values());
  };

  // Get messages for active chat
  const getChatMessages = (): Message[] => {
    if (!currentUser || !activeChat) return [];
    return messages
      .filter(m => 
        (m.senderId === currentUser.id && m.receiverId === activeChat) ||
        (m.senderId === activeChat && m.receiverId === currentUser.id)
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 mb-4">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
              InstaSocial
            </h1>
            <p className="text-gray-400">Arkadaşlarınla anlarını paylaş</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-700">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  isLogin
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Giriş Yap
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  !isLogin
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Kayıt Ol
              </button>
            </div>

            <div className="space-y-4">
              {!isLogin && (
                <input
                  type="text"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  placeholder="Kullanıcı Adı"
                  className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              )}
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
              />
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="Şifre"
                className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
              />
              <button
                onClick={isLogin ? handleLogin : handleRegister}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              InstaSocial
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNewPost(true)}
              className="p-2 hover:bg-gray-800 rounded-xl transition-all"
            >
              <Plus className="w-6 h-6 text-gray-300" />
            </button>
            <button
              onClick={() => setShowUserSearch(true)}
              className="p-2 hover:bg-gray-800 rounded-xl transition-all"
            >
              <Search className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pb-20">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <Camera className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">Henüz gönderi yok</p>
                <button
                  onClick={() => setShowNewPost(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  İlk Gönderiyi Oluştur
                </button>
              </div>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLike={handleLikePost}
                  onComment={handleAddComment}
                />
              ))
            )}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Arkadaşlarım</h2>
              <p className="text-gray-400">{currentUser.friends.length} arkadaş</p>
            </div>

            <div className="space-y-3">
              {currentUser.friends.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">Henüz arkadaşın yok</p>
                  <button
                    onClick={() => setShowUserSearch(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    Arkadaş Ekle
                  </button>
                </div>
              ) : (
                currentUser.friends.map(friendId => {
                  const friend = users.find(u => u.id === friendId);
                  if (!friend) return null;

                  return (
                    <div key={friendId} className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between border border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                          ) : (
                            friend.username[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{friend.username}</p>
                          <p className="text-sm text-gray-400">{friend.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friendId)}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all border border-gray-700"
                      >
                        Arkadaş
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 h-[calc(100vh-200px)] flex">
              {/* Chat List */}
              <div className="w-80 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                  <h2 className="text-xl font-bold text-white">Mesajlar</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {getChats().length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <MessageCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-500">Henüz mesajın yok</p>
                    </div>
                  ) : (
                    getChats().map(chat => (
                      <button
                        key={chat.userId}
                        onClick={() => setActiveChat(chat.userId)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800 transition-all ${
                          activeChat === chat.userId ? 'bg-gray-800' : ''
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                          {chat.avatar ? (
                            <img src={chat.avatar} alt={chat.username} className="w-full h-full object-cover" />
                          ) : (
                            chat.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-white truncate">{chat.username}</p>
                          <p className="text-sm text-gray-400 truncate">{chat.lastMessage || 'Mesaj yok'}</p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{chat.unreadCount}</span>
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {activeChat ? (
                  <>
                    <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                        {users.find(u => u.id === activeChat)?.avatar ? (
                          <img 
                            src={users.find(u => u.id === activeChat)?.avatar} 
                            alt={users.find(u => u.id === activeChat)?.username} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          users.find(u => u.id === activeChat)?.username[0].toUpperCase()
                        )}
                      </div>
                      <p className="font-semibold text-white">
                        {users.find(u => u.id === activeChat)?.username}
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {getChatMessages().map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-2xl ${
                              msg.senderId === currentUser.id
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none'
                                : 'bg-gray-800 text-white rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-gray-800">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Mesaj yaz..."
                          className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-500">Sohbet başlatmak için bir arkadaş seç</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white font-bold text-4xl overflow-hidden border-4 border-gray-800">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.username[0].toUpperCase()
                    )}
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all border-4 border-gray-900"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{currentUser.username}</h2>
                <p className="text-gray-400 mb-4">{currentUser.email}</p>

                <div className="flex gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{posts.filter(p => p.userId === currentUser.id).length}</p>
                    <p className="text-gray-400 text-sm">Gönderi</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{currentUser.friends.length}</p>
                    <p className="text-gray-400 text-sm">Arkadaş</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {posts.reduce((acc, post) => post.userId === currentUser.id ? acc + post.likes.length : acc, 0)}
                    </p>
                    <p className="text-gray-400 text-sm">Beğeni</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all border border-gray-700 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Gönderilerim</h3>
                <div className="grid grid-cols-3 gap-2">
                  {posts
                    .filter(p => p.userId === currentUser.id)
                    .map(post => (
                      <div key={post.id} className="aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                        {post.mediaUrl ? (
                          post.mediaType === 'image' ? (
                            <img src={post.mediaUrl} alt="Post" className="w-full h-full object-cover" />
                          ) : (
                            <video src={post.mediaUrl} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-2">
                            <p className="text-xs text-gray-400 line-clamp-6">{post.content}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
                {posts.filter(p => p.userId === currentUser.id).length === 0 && (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz gönderin yok</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-3 z-40">
        <div className="max-w-6xl mx-auto flex justify-around items-center">
          <button
            onClick={() => setActiveTab('home')}
            className={`p-3 rounded-xl transition-all ${
              activeTab === 'home' ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Home className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`p-3 rounded-xl transition-all ${
              activeTab === 'friends' ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Users className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`p-3 rounded-xl transition-all ${
              activeTab === 'messages' ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-3 rounded-xl transition-all ${
              activeTab === 'profile' ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-gray-800">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Yeni Gönderi</h2>
              <button
                onClick={() => {
                  setShowNewPost(false);
                  setNewPostContent('');
                  setNewPostMedia(null);
                }}
                className="p-2 hover:bg-gray-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Ne düşünüyorsun?"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-none h-32"
              />

              {newPostMedia && (
                <div className="relative rounded-xl overflow-hidden border border-gray-700">
                  {newPostMedia.type === 'image' ? (
                    <img src={newPostMedia.url} alt="Preview" className="w-full max-h-96 object-cover" />
                  ) : (
                    <video src={newPostMedia.url} controls className="w-full max-h-96" />
                  )}
                  <button
                    onClick={() => setNewPostMedia(null)}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 bg-gray-800 text-purple-400 rounded-xl font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2 border border-gray-700"
                >
                  <Image className="w-5 h-5" />
                  Fotoğraf
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 bg-gray-800 text-pink-400 rounded-xl font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2 border border-gray-700"
                >
                  <Video className="w-5 h-5" />
                  Video
                </button>
              </div>

              <button
                onClick={handleCreatePost}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Paylaş
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Search Modal */}
      {showUserSearch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-gray-800">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Kullanıcı Ara</h2>
              <button
                onClick={() => {
                  setShowUserSearch(false);
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-gray-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kullanıcı ara..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {users
                .filter(u => 
                  u.id !== currentUser.id &&
                  (u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map(user => (
                  <div key={user.id} className="mb-3 p-4 bg-gray-800 rounded-xl flex items-center justify-between border border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          user.username[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.username}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    {currentUser.friends.includes(user.id) ? (
                      <button
                        onClick={() => handleRemoveFriend(user.id)}
                        className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all border border-gray-600"
                      >
                        Arkadaş
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddFriend(user.id)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Takip Et
                      </button>
                    )}
                  </div>
                ))}
              {users.filter(u => 
                u.id !== currentUser.id &&
                (u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 u.email.toLowerCase().includes(searchQuery.toLowerCase()))
              ).length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500">Kullanıcı bulunamadı</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Post Card Component
const PostCard: React.FC<{
  post: Post;
  currentUser: User;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
}> = ({ post, currentUser, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  const handleAddComment = () => {
    if (commentInput.trim()) {
      onComment(post.id, commentInput);
      setCommentInput('');
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
            {post.userAvatar ? (
              <img src={post.userAvatar} alt={post.username} className="w-full h-full object-cover" />
            ) : (
              post.username[0].toUpperCase()
            )}
          </div>
          <div>
            <p className="font-semibold text-white">{post.username}</p>
            <p className="text-xs text-gray-400">
              {new Date(post.timestamp).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-800 rounded-xl transition-all">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Post Media */}
      {post.mediaUrl && (
        <div className="w-full bg-black">
          {post.mediaType === 'image' ? (
            <img src={post.mediaUrl} alt="Post" className="w-full object-contain max-h-[600px]" />
          ) : (
            <video src={post.mediaUrl} controls className="w-full max-h-[600px]" />
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(post.id)}
              className={`transition-all ${
                post.likes.includes(currentUser.id) ? 'text-pink-500 scale-110' : 'text-gray-300 hover:text-pink-500'
              }`}
            >
              <Heart className={`w-7 h-7 ${post.likes.includes(currentUser.id) ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-300 hover:text-purple-400 transition-all"
            >
              <MessageCircle className="w-7 h-7" />
            </button>
          </div>
          <button className="text-gray-300 hover:text-yellow-400 transition-all">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Likes Count */}
        {post.likes.length > 0 && (
          <p className="font-semibold text-white text-sm">
            {post.likes.length} beğeni
          </p>
        )}

        {/* Post Content */}
        {post.content && (
          <div className="text-white">
            <span className="font-semibold mr-2">{post.username}</span>
            <span className="text-gray-300">{post.content}</span>
          </div>
        )}

        {/* View Comments */}
        {post.comments.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-gray-400 text-sm hover:text-gray-300 transition-all"
          >
            {post.comments.length} yorumun tümünü gör
          </button>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-2">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <div className="flex-1">
                  <p className="text-white">
                    <span className="font-semibold mr-2">{comment.username}</span>
                    <span className="text-gray-300">{comment.content}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment */}
        <div className="flex gap-2 pt-2 border-t border-gray-800">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder="Yorum ekle..."
            className="flex-1 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none text-sm transition-all"
          />
          <button
            onClick={handleAddComment}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all font-semibold"
          >
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialApp;
