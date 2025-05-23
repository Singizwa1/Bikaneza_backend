const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config();


app.get('/',(req, res)=>{
  res.send('Welcome to Stock Management API');
})


const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
