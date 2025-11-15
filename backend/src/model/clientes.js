import { Schema ,model} from "mongoose"


const ClienteSchema = new Schema({
    nombre:{
        type:String,
        require:true
    },
    producto:{
        type:String,
        require:true
    },
    fechaPedido:{
        type:Date,
        require:true
    },
    telefono:{
        type:String,require:true
    },
    dirrecion:{
        type:String,
        require:true
    },
   estado:{
    type:String,
    require:true
   }
},{timestamps:true,
    strict:false
});


export default model ("Cliente",ClienteSchema);