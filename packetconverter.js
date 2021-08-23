var fs = require("fs");

var loginPacket = require("./loginpackets").packets;

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
                scriptBuilder += "public boolean " + schema[i].name + " { get;set;}";
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
            if(schema[i].type === 'byteswithlength'){
                scriptBuilder += "[Schema.Fields]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public "+ capitalizeFirstLetter(schema[i].name) + " " + schema[i].name + " { get;set;}"
                subClasses.push(processSchema(capitalizeFirstLetter(schema[i].name), schema[i].fields, "", subClasses));
                continue;
            }
            if(schema[i].type === 'schema'){
                scriptBuilder += "[Schema.Fields]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public "+ capitalizeFirstLetter(schema[i].name) + " " + schema[i].name + " { get;set;}"
                subClasses.push(processSchema(capitalizeFirstLetter(schema[i].name), schema[i].fields, "", subClasses));
                continue;
            }
            if(schema[i].type === 'array'){
                scriptBuilder += "[Schema.Field]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public " + capitalizeFirstLetter(schema[i].name) + "[] " + schema[i].name + " { get;set;}"
                subClasses.push(processSchema(capitalizeFirstLetter(schema[i].name), schema[i].fields, "", subClasses));
                continue;
            }
            if(schema[i].type === 'bitflags'){
                scriptBuilder += "[Schema.Field]"; 
                scriptBuilder += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                scriptBuilder += "public " + capitalizeFirstLetter(schema[i].name) + "[] " + schema[i].name + " { get;set;}"
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
        value += "public class Flags{bool bit0{get;set;},bool bit1{get;set;},bool bit2{get;set;},bool bit3{get;set;},bool bit4{get;set;},bool bit5{get;set;},bool bit6{get;set;},bool bit7{get;set;}}";
    }
    fs.writeFile('Class_' + packeToConvert.name +'.cs', value, function (err) {
        if (err) return console.log(err);
      });
})
