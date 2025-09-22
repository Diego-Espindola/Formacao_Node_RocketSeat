import { Readable, Writable, Transform } from 'node:stream';


class OneToHundredStream extends Readable {
    index = 1;

    _read() {
        const i = this.index++;

        setTimeout(() => {
            if(i > 100){
                this.push(null);
            }else{
                const buf = Buffer.from(String(i));
                this.push(buf);
            }
        }, 100)
    }
}

class InverseNumberStream extends Transform {
    _transform(chunk, encoding, callback) {
        const transformed = Number(chunk.toString()) * -1;
        callback(null, Buffer.from(String(transformed)));
    }
}

class MultiplyByTenStream extends Writable {
    _write(chunk, encoding, callback) {
        console.log(Number(chunk.toString()) * 10);
        callback();
    }
}

new OneToHundredStream() // Streams de leitura
    .pipe(new InverseNumberStream()) // Streams de transformação - leêm e escrevem
    .pipe(new MultiplyByTenStream()); // Streams de escrita, feitas para processar dados


// Stream duplex, como se fosse um arquivo físico no nosso sistema, podemos tanto ler quanto escrever
