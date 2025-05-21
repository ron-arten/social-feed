const profileImages: Record<string, any> = {
  'assets/images/profiles/profile_1.jpg': require('../../assets/images/profiles/profile_1.jpg'),
  'assets/images/profiles/profile_2.jpg': require('../../assets/images/profiles/profile_2.jpg'),
  'assets/images/profiles/profile_3.jpg': require('../../assets/images/profiles/profile_3.jpg'),
  'assets/images/profiles/profile_4.jpg': require('../../assets/images/profiles/profile_4.jpg'),
  'assets/images/profiles/profile_5.jpg': require('../../assets/images/profiles/profile_5.jpg'),
  'assets/images/profiles/profile_6.jpg': require('../../assets/images/profiles/profile_6.jpg'),
  'assets/images/profiles/profile_7.jpg': require('../../assets/images/profiles/profile_7.jpg'),
  'assets/images/profiles/profile_8.jpg': require('../../assets/images/profiles/profile_8.jpg'),
  'assets/images/profiles/profile_9.jpg': require('../../assets/images/profiles/profile_9.jpg'),
  'assets/images/profiles/profile_10.jpg': require('../../assets/images/profiles/profile_10.jpg'),
  'assets/images/profiles/profile_11.jpg': require('../../assets/images/profiles/profile_11.jpg'),
  'assets/images/profiles/profile_12.jpg': require('../../assets/images/profiles/profile_12.jpg'),
  'assets/images/profiles/profile_13.jpg': require('../../assets/images/profiles/profile_13.jpg'),
};

const postImages: Record<string, any> = {
  'assets/images/posts/post_1.jpg': require('../../assets/images/posts/post_1.jpg'),
  'assets/images/posts/post_2.jpg': require('../../assets/images/posts/post_2.jpg'),
  'assets/images/posts/post_3.jpg': require('../../assets/images/posts/post_3.jpg'),
  'assets/images/posts/post_4.jpg': require('../../assets/images/posts/post_4.jpg'),
  'assets/images/posts/post_5.jpg': require('../../assets/images/posts/post_5.jpg'),
  'assets/images/posts/post_6.jpg': require('../../assets/images/posts/post_6.jpg'),
  'assets/images/posts/post_7.jpg': require('../../assets/images/posts/post_7.jpg'),
  'assets/images/posts/post_8.jpg': require('../../assets/images/posts/post_8.jpg'),
  'assets/images/posts/post_9.jpg': require('../../assets/images/posts/post_9.jpg'),
  'assets/images/posts/post_10.jpg': require('../../assets/images/posts/post_10.jpg'),
};

export function getLocalImageSource(path?: string | null): any | undefined {
  if (!path) return undefined;
  if (profileImages[path]) return profileImages[path];
  if (postImages[path]) return postImages[path];
  return undefined;
} 