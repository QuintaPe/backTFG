// Read environment variables
require('dotenv').config();

const app = require('./server');
require('./database');
require('./mailer');

// Server is listening
app.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});
