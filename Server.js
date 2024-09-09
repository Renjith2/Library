const express = require('express')
const app = express();
const dbconfig=require('./databaseConfig/databaseConfig')
const userRoute=require('./routes/UserRoute')
const bookRoute=require('./routes/BookRoute')
const libraryRoute=require('./routes/LibraryRoute')
const LibraryInventoryRoute=require('./routes/LibraryInventoryRoute')
const borrowRouter=require('./routes/BorrowRoute')


app.use(express.json())
app.use('/api/users',userRoute);
app.use('/api/books',bookRoute);
app.use('/api/libraries',libraryRoute);
app.use('/',LibraryInventoryRoute)
app.use('/',borrowRouter)
app.listen(9098,()=>{
    console.log("Server have been started!!!!!")
})

app.get('/',(req,res)=>{
    res.send("The Server have started !!!")
})

