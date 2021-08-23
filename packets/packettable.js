"use strict";
// ======================================================================
//
//   GNU GENERAL PUBLIC LICENSE
//   Version 3, 29 June 2007
//   copyright (c) 2020 - 2021 Quentin Gruber
//   copyright (c) 2021 H1emu community
//
//   https://github.com/QuentinGruber/h1z1-server
//   https://www.npmjs.com/package/h1z1-server
//
//   Based on https://github.com/psemu/soe-network
// ======================================================================
Object.defineProperty(exports, "__esModule", { value: true });
function PacketTableBuild(packets, prefix) {
    prefix = prefix ? prefix + "." : "";
    const packetTypes = {};
    const packetDescriptors = {};
    for (let i = 0; i < packets.length; i++) {
        const packet = packets[i], name = prefix + packet[0], type = packet[1] >>> 0, packetDesc = packet[2];
        packetTypes[name] = type;
        packetDescriptors[type] = {
            type: type,
            name: name,
            schema: packetDesc.fields,
            fn: packetDesc.fn,
            parse: packetDesc.parse,
            pack: packetDesc.pack,
        };
    }
    return [packetTypes, packetDescriptors];
}
exports.default = PacketTableBuild;
//# sourceMappingURL=packettable.js.map