/**
 * Created by jim on 6/22/2017.
 */
import crypto from 'crypto'

export default function md5 (str) {
    const md5sum = crypto.createHash('md5')
    md5sum.update(str)
    return md5sum.digest('hex')
}
