const fs = require('fs');

if (process.env.GOOGLE_SERVICES_JSON_BASE64) {
  try {
    fs.writeFileSync(
      './google-services.json',
      Buffer.from(process.env.GOOGLE_SERVICES_JSON_BASE64, 'base64')
    );
    console.log('Successfully created google-services.json from secret.');
  } catch (error) {
    console.error('Failed to write google-services.json:', error);
    process.exit(1);
  }
} else {
  console.warn('GOOGLE_SERVICES_JSON_BASE64 environment variable not set.');
}

if (process.env.GOOGLE_SERVICES_INFO_PLIST_BASE64) {
  try {
    fs.writeFileSync(
      './GoogleService-Info.plist',
      Buffer.from(process.env.GOOGLE_SERVICES_INFO_PLIST_BASE64, 'base64')
    );
    console.log('Successfully created GoogleService-Info.plist from secret.');
  } catch (error) {
    console.error('Failed to write GoogleService-Info.plist:', error);
    process.exit(1);
  }
}
