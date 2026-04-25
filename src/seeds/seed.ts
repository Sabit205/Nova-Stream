import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in environment');
  process.exit(1);
}

// Schemas (inline to avoid compilation issues)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, default: 'Active' },
  exp_date: { type: Number, required: true },
  max_connections: { type: Number, default: 1 },
  created_at: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  is_trial: { type: String, default: '0' },
});

const categorySchema = new mongoose.Schema({
  category_id: { type: String, required: true, unique: true },
  category_name: { type: String, required: true },
});

const channelSchema = new mongoose.Schema({
  stream_id: { type: Number, required: true, unique: true },
  num: { type: Number, default: 1 },
  name: { type: String, required: true },
  stream_url: { type: String, required: true },
  stream_icon: { type: String, default: '' },
  category_id: { type: String, required: true },
  epg_channel_id: { type: String, default: '' },
  added: { type: String, default: () => Math.floor(Date.now() / 1000).toString() },
  stream_type: { type: String, default: 'live' },
});

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI!);
  console.log('✅ Connected to MongoDB');

  const User = mongoose.model('User', userSchema, 'users');
  const Category = mongoose.model('Category', categorySchema, 'categories');
  const Channel = mongoose.model('Channel', channelSchema, 'channels');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await User.deleteMany({});
  await Category.deleteMany({});
  await Channel.deleteMany({});

  // Create categories
  console.log('📁 Creating categories...');
  const categories = await Category.insertMany([
    { category_id: '1', category_name: 'Sports' },
    { category_id: '2', category_name: 'News' },
    { category_id: '3', category_name: 'Entertainment' },
  ]);
  console.log(`   ✅ Created ${categories.length} categories`);

  // Create channels with public test HLS streams
  console.log('📺 Creating channels...');
  const now = Math.floor(Date.now() / 1000).toString();
  const channels = await Channel.insertMany([
    {
      stream_id: 1,
      num: 1,
      name: 'Big Buck Bunny',
      stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      stream_icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg',
      category_id: '3',
      epg_channel_id: 'bbb.us',
      added: now,
    },
    {
      stream_id: 2,
      num: 2,
      name: 'Sintel',
      stream_url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
      stream_icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sintel_poster.jpg/220px-Sintel_poster.jpg',
      category_id: '3',
      epg_channel_id: 'sintel.us',
      added: now,
    },
    {
      stream_id: 3,
      num: 3,
      name: 'Tears of Steel',
      stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      stream_icon: 'https://mango.blender.org/wp-content/uploads/2012/05/01_thom_702.jpg',
      category_id: '3',
      epg_channel_id: 'tos.us',
      added: now,
    },
    {
      stream_id: 4,
      num: 4,
      name: 'ESPN Demo',
      stream_url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
      stream_icon: '',
      category_id: '1',
      epg_channel_id: 'espn.us',
      added: now,
    },
    {
      stream_id: 5,
      num: 5,
      name: 'Fox Sports Demo',
      stream_url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
      stream_icon: '',
      category_id: '1',
      epg_channel_id: 'fox.us',
      added: now,
    },
    {
      stream_id: 6,
      num: 6,
      name: 'CNN Demo',
      stream_url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_adv_example_hevc/master.m3u8',
      stream_icon: '',
      category_id: '2',
      epg_channel_id: 'cnn.us',
      added: now,
    },
  ]);
  console.log(`   ✅ Created ${channels.length} channels`);

  // Create users
  console.log('👥 Creating users...');
  const thirtyDays = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
  const sevenDays = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

  const users = await User.insertMany([
    {
      username: 'demo',
      password: await bcrypt.hash('demo123', 10),
      status: 'Active',
      exp_date: thirtyDays,
      max_connections: 2,
      is_trial: '0',
    },
    {
      username: 'test',
      password: await bcrypt.hash('test123', 10),
      status: 'Active',
      exp_date: sevenDays,
      max_connections: 1,
      is_trial: '1',
    },
  ]);
  console.log(`   ✅ Created ${users.length} users`);

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('Demo credentials:');
  console.log('  Username: demo  |  Password: demo123');
  console.log('  Username: test  |  Password: test123');
  console.log('─────────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
