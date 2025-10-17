#!/bin/bash

# Build the client
echo "Building client..."
cd client
npm run build
cd ..

# Create a simple static deployment
echo "Creating static deployment..."
mkdir -p dist
cp -r client/build/* dist/
cp server.js dist/

# Create a simple index.html that serves the React app
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Group Conscience Voting App" />
    <title>Group Conscience Voting</title>
    <link rel="stylesheet" href="/static/css/main.css">
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script src="/static/js/main.js"></script>
  </body>
</html>
EOF

echo "Static deployment created in dist/ directory"
echo "You can serve this with: npx serve dist"
