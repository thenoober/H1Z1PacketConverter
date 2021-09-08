var fs = require("fs");

var loginPacket = require("./packets/h1z1packets").Packets;

//set to true if the class will load data from mongodb
var generateBsonAttribute = true;

//set to true if a bitflag field is found
var bitflagFieldFound = false;

//set the packets opcode that you wish to convert
var packeToConvert = loginPacket[0x03];


var subClasses = new Array();

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

function classNameExist(listOfClasses, name){
    if(listOfClasses.length <= 0){
        return false;
    }
    for(var i = 0;i < listOfClasses.length;i++){
        if(listOfClasses[i] == name){
            return true;
        }
    }
    return false;
}

async function processSchema(name, schema, classProperties, subClasses) {
    let classShell = "public class " + name + "{";
    if(schema){
        for(var i = 0; i < schema.length;i++){
            if(schema[i].type === 'string'){
                classProperties += "[Schema.Field]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public string " + schema[i].name + " { get;set;}";
                classProperties += (schema[i].defaultValue)? " = " + schema[i].defaultValue + ";" : "";
                continue;
            }
            if(schema[i].type === 'boolean'){
                classProperties += "[Schema.Field]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public bool " + schema[i].name + " { get;set;}";
                classProperties += (schema[i].defaultValue)? " = " + schema[i].defaultValue + ";" : "";
                continue;
            }
            if(schema[i].type === 'uint8'){
                classProperties += "[Schema.Field]";
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public byte " + schema[i].name + " { get;set;}";
                classProperties += (schema[i].defaultValue)? " = " + schema[i].defaultValue + ";" : "";
                continue;
            }
            if(schema[i].type === 'uint16'){
                classProperties += "[Schema.Field]";
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public ushort " + schema[i].name + " { get;set;}";
                classProperties += (schema[i].defaultValue)? " = " + schema[i].defaultValue + ";" : "";
                continue;
            }
            if(schema[i].type === 'uint32'){
                classProperties += "[Schema.Field]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public uint " + schema[i].name + " { get;set;}";
                classProperties += (schema[i].defaultValue)? " = " + schema[i].defaultValue + ";" : "";
                continue;
            }
            if(schema[i].type === 'int32'){
                classProperties += "[Schema.Field]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public int " + schema[i].name + " { get;set;}";
                classProperties += (schema[i].defaultValue)? " = " + schema[i].defaultValue + ";" : "";
                continue;
            }
            if(schema[i].type === 'uint64'){
                classProperties += "[Schema.Field]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public ulong " + schema[i].name + " { get;set;}"
                classProperties += (schema[i].defaultValue)? " = " + schema[i].defaultValue + ";" : "";
                continue;
            }
            if(schema[i].type === 'float'){
                classProperties += "[Schema.Field]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public float " + schema[i].name + " { get;set;}"
                classProperties += (schema[i].defaultValue)? " = " + schema[i].defaultValue + ";" : "";
                continue;
            }
            if(schema[i].type === 'double'){
                classProperties += "[Schema.Field]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public double " + schema[i].name + " { get;set;}"
                classProperties += (schema[i].defaultValue)? " = " + schema[i].defaultValue + ";" : "";
                continue;
            }
            if(schema[i].type === 'floatvector3' || schema[i].type === 'floatvector4'){
                classProperties += "[Schema.ArrayField(\"Float\")]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public float[] " + schema[i].name + " { get;set;}"
                classProperties += (schema[i].defaultValue)? " = " + schema[i].defaultValue + ";" : "";
                continue;
            }
            if(schema[i].type === 'byteswithlength'){
                let subClassName = capitalizeFirstLetter(schema[i].name);
                classProperties += "[Schema.ObjectField(\"BytesWithLength\")]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public "+ subClassName + " " + schema[i].name + " { get;set;}"
                if(subClassName == name){
                    classShell += await processSchema(subClassName + "_0", schema[i].fields, "", subClasses);
                }else{
                    classShell += await processSchema(subClassName, schema[i].fields, "", subClasses);
                }
                continue;
            }
            if(schema[i].type === 'schema'){
                let subClassName = capitalizeFirstLetter(schema[i].name);
                classProperties += "[Schema.ObjectField(\"Object\")]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public "+ capitalizeFirstLetter(schema[i].name) + " " + schema[i].name + " { get;set;}"
                if(subClassName == name){
                    classShell += await processSchema(subClassName + "_0", schema[i].fields, "", subClasses);
                }else{
                    classShell += await processSchema(subClassName, schema[i].fields, "", subClasses);
                }
                continue;
            }
            if(schema[i].type === 'unsignedIntWith2bitLength'){
                classProperties += "[Schema.ObjectField(\"UnsignedIntWith2bitLength\")]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                classProperties += "public byte[] " + schema[i].name + " { get;set;}"
                continue;
            }
            if(schema[i].type === 'array'){
                let subClassName = capitalizeFirstLetter(schema[i].name);
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
                    propertyType = subClassName;
                }

                classProperties += "[Schema.ArrayField(\""+ arrayType +"\")]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 

                classProperties += "public " + propertyType + "[] " + schema[i].name + " { get;set;}"
                if(subClassName == name){
                    classShell += await processSchema(subClassName + "_0", schema[i].fields, "", subClasses);
                }else{
                    classShell += await processSchema(subClassName, schema[i].fields, "", subClasses);
                }
                continue;
            }
            if(schema[i].type === 'bitflags'){
                let subClassName = capitalizeFirstLetter(schema[i].name);
                classProperties += "[Schema.ObjectField(\"Flags\")]"; 
                classProperties += (generateBsonAttribute)? "[BsonElement(\"" + schema[i].name + "\")]" : ""; 
                if(subClassName == name){
                    classShell += await processSchema(subClassName + "_0", schema[i].fields, "", subClasses);
                }else{
                    classShell += await processSchema(subClassName, schema[i].fields, "", subClasses);
                }
                bitflagFieldFound = true;
                continue;
            }
            console.log(schema[i].name + " located in " + name + " has an unknown type: " + schema[i].type);
        }
    
    }else{
        console.log("Schema has no known fields: " + name);
    }

    classShell += classProperties;
    classShell += "}";
    return classShell;
};

var packet = processSchema(packeToConvert.name, packeToConvert.schema, "", subClasses);

packet.then(async value=>{
    //for(var j = 0;j < subClasses.length;j++){
    //    value += await subClasses[j];
   // }
    if(bitflagFieldFound){
        //generate bitflag class
        value += "public class Flags{[BsonElement(\"bit0\")][Schema.Field]bool bit0{get;set;}[BsonElement(\"bit1\")][Schema.Field]bool bit1{get;set;}[BsonElement(\"bit2\")][Schema.Field]bool bit2{get;set;}[BsonElement(\"bit3\")][Schema.Field]bool bit3{get;set;}[BsonElement(\"bit4\")][Schema.Field]bool bit4{get;set;}[BsonElement(\"bit5\")][Schema.Field]bool bit5{get;set;}[BsonElement(\"bit6\")][Schema.Field]bool bit6{get;set;}[BsonElement(\"required\")][Schema.Field]bool required{get;set;}}";
    }
    fs.writeFile('./converted/Class_' + packeToConvert.name +'.cs', value, function (err) {
        if (err) return console.log(err);
      });
})
