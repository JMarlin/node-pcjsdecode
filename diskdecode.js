in_name = 'WIN95-DISK01.json';
out_name = 'WIN95-DISK01.img';

//=============================================================================================================
//=============================================================================================================

var fs   = require('fs'),
    file = fs.readFileSync(in_name),
    json = JSON.parse(file),
    out_buf = new Buffer(512),
    out_file = fs.createWriteStream(out_name),
    get_byte = function(data, i) {
    
        var w = i >>> 2,
            b = i % 4;
    
        return ((((data) & (0xFF << (b*8))) >>> (b*8)) & 0xFF) >>> 0;
    },
    j,
    ci, hi, si;

out_file.on('error', function(e) {
    console.log('there was an error writing the file: ' + e);
})

ci = 0;
(function next_cylinder() {
    if(ci === json.length) {
        
        out_file.end(); 
        return;
    }
    
    hi = 0;
    (function next_head() {
        if(hi === json[ci].length) {
            
            ci++;
            next_cylinder();
            return;
        }
            
        si = 0;
        (function next_sector() {
            if(si === json[ci][hi].length) {
                
                hi++;
                next_head();
                return;
            }
                
            j = 0;
            console.log(ci + ', ' + hi + ', ' + si + ' - ' + json.length);
            json[ci][hi][si].data.forEach(function(w) {
                
                for(var i = 0; i < 4; i++) {
                    var val = get_byte(w, i);
                    out_buf.writeUInt8(val, j++);
                } 
            });
            
            si++;
            out_file.write(out_buf, next_sector);
        })();
    })();
})(); 



