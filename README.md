# TwitterUsers

A NodeJS tool for mass retrieving user information from Twitter.
TwitterUsers is a small express app that allows you to upload csv's of twitter user
names and get a csv back with the following information:

 * User Name
 * Screen Name
 * User ID
 * Friends Count
 * Followers Count
 * Following (If you are following them)
 * Followed (If they are following you)

## Installation

This has a two step installation process:

 * Fill out information in `conf.json`
 * Run `npm install` from the root directory

## Usage

Once you have everything installed, you can run the tool with the following steps:

 * Run `npm start` from the root directory to start the express app
 * Navigate to `http://localhost:3000` to view the tool
 * Upload a csv of Twitter user names, not including the @ sign. Supports either comma's or new line's as separators
 * Receive results

## Notes

This uses the Twitter API and as such, is subject to rate limiting. The two
endpoints that it uses are `users/lookup` and `followers/ids`. The followers
endpoint is the most likely to cause rate limit issues, and as such the results
are cached for 15 minutes

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## History

v0.1.0 - Fixed bad version, cleaned up package.json, added this README
v0.0.0 - Initial Commit

## Credits

Written by Nick Grant <nick@nickgrant.io>