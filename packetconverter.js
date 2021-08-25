var fs = require("fs");

var loginPacket = require("./packets/loginpackets").packets;

//set to true if the class will load data from mongodb
var generateBsonAttribute = true;

//set to true if a bitflag field is found
var bitflagFieldFound = false;

//set the packets opcode that you wish to convert
var packeToConvert = loginPacket.Packets[0X0c];


var subClasses = new Array();

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

async function processSchema(name, schema, scriptBuilder, subClasses) {
    scriptBuilder = "public class " + name + "{";
    if(schema){
        for(var i = 0; i < schema.length;i++){
            if(schema[i].type === 'string'){
                scriptBuilder += "[Schema.Field]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public string " + schema[i].name + " { get;set;}";
                continue;
            }
            if(schema[i].type === 'boolean'){
                scriptBuilder += "[Schema.Field]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public bool " + schema[i].name + " { get;set;}";
                continue;
            }
            if(schema[i].type === 'uint8'){
                scriptBuilder += "[Schema.Field]";
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public byte " + schema[i].name + " { get;set;}";
                continue;
            }
            if(schema[i].type === 'uint16'){
                scriptBuilder += "[Schema.Field]";
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public ushort " + schema[i].name + " { get;set;}";
                continue;
            }
            if(schema[i].type === 'uint32'){
                scriptBuilder += "[Schema.Field]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public uint " + schema[i].name + " { get;set;}";
                continue;
            }
            if(schema[i].type === 'uint64'){
                scriptBuilder += "[Schema.Field]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public ulong " + schema[i].name + " { get;set;}"
                continue;
            }
            if(schema[i].type === 'float'){
                scriptBuilder += "[Schema.Field]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public float " + schema[i].name + " { get;set;}"
                continue;
            }
            if(schema[i].type === 'double'){
                scriptBuilder += "[Schema.Field]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public double " + schema[i].name + " { get;set;}"
                continue;
            }
            if(schema[i].type === 'byteswithlength'){
                scriptBuilder += "[Schema.ObjectField(\"BytesWithlength\")]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public "+ capitalizeFirstLetter(schema[i].name) + " " + schema[i].name + " { get;set;}"
                subClasses.push(processSchema(capitalizeFirstLetter(schema[i].name), schema[i].fields, "", subClasses));
                continue;
            }
            if(schema[i].type === 'schema'){
                scriptBuilder += "[Schema.ObjectField(\"Object\")]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public "+ capitalizeFirstLetter(schema[i].name) + " " + schema[i].name + " { get;set;}"
                subClasses.push(processSchema(capitalizeFirstLetter(schema[i].name), schema[i].fields, "", subClasses));
                continue;
            }
            if(schema[i].type === 'array'){
                var arrayType = "";
                var propertyType = "";
                if(schema[i].elementType){
                    if(schema[i].elementType == "uint8"){
                        arrayType = "Uint8";
                        propertyType = "byte"
                    }else if(schema[i].elementType == "uint16"){
                        arrayType = "Uint16";
                        propertyType = "ushort";
                    }else if(schema[i].elementType == "uint32"){
                        arrayType = "uint";
                    }
                }else{
                    arrayType = "Object";
                    propertyType = capitalizeFirstLetter(schema[i].name);
                }

                scriptBuilder += "[Schema.ArrayField(\""+ arrayType +"\")]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 

                scriptBuilder += "public " + propertyType + "[] " + schema[i].name + " { get;set;}"
                subClasses.push(processSchema(capitalizeFirstLetter(schema[i].name), schema[i].fields, "", subClasses));
                continue;
            }
            if(schema[i].type === 'bitflags'){
                scriptBuilder += "[Schema.Field]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public " + capitalizeFirstLetter(schema[i].name) + schema[i].name + " { get;set;}"
                bitflagFieldFound = true;
                continue;
            }
            console.log(schema[i].name + " located in " + name + " has an unknown type: " + schema[i].type);
        }
    
    }else{
        console.log("Schema has no known fields: " + name);
    }

    
    scriptBuilder += "}";
    return scriptBuilder;
};

var packet = processSchema(packeToConvert.name, packeToConvert.schema, "", subClasses);

packet.then(async value=>{
    for(var j = 0;j < subClasses.length;j++){
        value += await subClasses[j];
    }
    if(bitflagFieldFound){
        //generate bitflag class
        value += "public class Flags{[BsonElement(\"bit0\")][Schema.Field]bool bit0{get;set;}[BsonElement(\"bit1\")][Schema.Field]bool bit1{get;set;}[BsonElement(\"bit2\")][Schema.Field]bool bit2{get;set;}[BsonElement(\"bit3\")][Schema.Field]bool bit3{get;set;}[BsonElement(\"bit4\")][Schema.Field]bool bit4{get;set;}[BsonElement(\"bit5\")][Schema.Field]bool bit5{get;set;}[BsonElement(\"bit6\")][Schema.Field]bool bit6{get;set;}[BsonElement(\"required\")][Schema.Field]bool required{get;set;}}";
    }
    fs.writeFile('./converted/Class_' + packeToConvert.name +'.cs', value, function (err) {
        if (err) return console.log(err);
      });
})
