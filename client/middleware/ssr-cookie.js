/**
 * Created by jim on 6/21/2017.
 */
import axios from '~/plugins/axios'

export default function ({ req }) {
    if (process.server) {
        axios.defaults.headers.common.cookie = req.headers.cookie || ''
        axios.defaults.headers.common['user-agent'] = req.headers['user-agent']
    }
}
