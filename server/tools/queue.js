
// 多并发限制
export default function queue (arr, limit, asyncFunc) {
    return new Promise((resolve, reject) => {
        const nArr = Array.prototype.slice.call(arr)
        let curr = 0
        let index = -1
        let completed = 0
        let abort = false
        let result = []

        next()

        function next () {
            if (completed === arr.length) {
                return resolve(result)
            }
            while (!abort && nArr.length && curr < limit) {
                const item = nArr.shift()
                const currIndex = ++index
                curr++
                asyncFunc(item, currIndex, arr)
                    .then(data => {
                        result[currIndex] = data
                        curr--
                        completed++
                        next()
                    })
                    .catch(err => {
                        abort = true
                        reject(err)
                    })
            }
        }
    })
}
