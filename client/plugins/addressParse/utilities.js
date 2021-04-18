import { recipientKeywords, totalKeywords } from './keywords'
import addressList from './addressList'

export const cleanAddress = (addressToParse) => {
    // 去换行等
    let address = addressToParse
        .replace(/\r\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\t/g, ' ')

    address = address.replace('中国', '')

    const pattern = new RegExp(
        "[`~!@#$^&*()=|{}':;',\\[\\]\\.<>/?~！@#￥……&*（）——|{}【】‘；：”“’。，、？]",
        'g'
    )
    address = address.replace(pattern, ' ')

    // 多个空格replace为一个
    address = address.replace(/ {2,}/g, ' ')

    return address
}

export const filterId = address => {
    let id = ''
    let newAddress = address
    const idReg = /\d{18}/g
    const match = idReg.exec(address)
    if (match) {
        id = match[0]
        newAddress = newAddress.replace(match[0], ' ')
    }
    return { newAddress, id }
}

export const filterPhone = (address) => {
    let phone = ''
    let newAddress = address
    // 整理电话格式
    newAddress = address.replace(/(\d{3})-(\d{4})-(\d{4})/g, '$1$2$3')
    newAddress = newAddress.replace(/(\d{3}) (\d{4}) (\d{4})/g, '$1$2$3')
    newAddress = newAddress.replace(/(\d{4}) \d{4} \d{4}/g, '$1$2$3')
    newAddress = newAddress.replace(/(\d{4})/g, '$1')

    const mobileReg = /(\d{7,12})|(\d{3,4}-\d{6,8})|(86-[1][0-9]{10})|(86[1][0-9]{10})|([1][0-9]{10})/g
    const mobile = mobileReg.exec(newAddress)
    if (mobile) {
        phone = mobile[0]
        newAddress = newAddress.replace(mobile[0], ' ')
    }
    return { newAddress, phone }
}

export const filterPostalCode = (address) => {
    let postalCode = ''
    let newAddress = address
    const postalCodeReg = /\d{6}/g
    const code = postalCodeReg.exec(newAddress)
    if (code) {
        postalCode = code[0]
        newAddress = newAddress.replace(code[0], ' ')
    }
    return { newAddress, postalCode }
}

export const getNameByKeyword = (address) => {
    let newAddress = address
    let name = ''
    const segmentArray = newAddress.split(' ')
    for (const keyword of recipientKeywords) {
        const matchingIndex = segmentArray.indexOf(keyword)
        if (matchingIndex !== -1) {
            const potentialName = segmentArray[matchingIndex + 1] || ''
            const isPotentialNameAKeyword = totalKeywords.includes(
                potentialName
            )
            name = isPotentialNameAKeyword ? '' : potentialName
            break
        }
    }
    newAddress = newAddress.replace(name, '')
    return { name, newAddress }
}

export const stripKeyWords = (address) => {
    let newAddress = address
    totalKeywords.forEach((str) => {
        newAddress = newAddress.replace(new RegExp(str, 'g'), ' ').trim()
    })
    return newAddress
}

export const getProvince = (address) => {
    let newAddress = address
    let matchingProvince = null
    for (const province of addressList) {
        const { name } = province
        let replaceName = ''
        for (let i = name.length; i > 1; i--) {
            const temp = name.substring(0, i)
            if (newAddress.includes(temp)) {
                replaceName = temp
                break
            }
        }
        if (replaceName) {
            matchingProvince = province
            newAddress = newAddress.replace(replaceName, '')
            break
        }
    }
    return { matchingProvince, newAddress }
}

const getAllCities = () => {
    const reducer = (existingCities, currentProvince) => {
        const { isDistrict, childs } = currentProvince
        if (!isDistrict) {
            return [...existingCities, ...childs]
        }
        return [...existingCities]
    }
    return addressList.reduce(reducer, [])
}

export const getCity = (address, matchingProvince = null) => {
    let newAddress = address
    let possibleCities = getAllCities()
    if (matchingProvince) {
        const { isDistrict, childs } = matchingProvince
        if (isDistrict) {
            return {
                newAddress,
                matchingCity: childs[0]
            }
        } else {
            possibleCities = childs
        }
    }
    let matchingCity = null
    for (const city of possibleCities) {
        const { name } = city
        let replaceName = ''
        for (let i = name.length; i > 1; i--) {
            const temp = name.substring(0, i)
            if (newAddress.includes(temp)) {
                replaceName = temp
                break
            }
        }
        if (replaceName) {
            matchingCity = city
            newAddress = newAddress.replace(replaceName, '')
            break
        }
    }
    return {
        newAddress,
        matchingCity
    }
}

export const getCounty = (address, matchingCity = null) => {
    let newAddress = address
    let matchingCounty = null
    if (!matchingCity) {
        return {
            missingCity: true,
            matchingCounty,
            newAddress
        }
    }

    // 地址库里没有市级以下资料，比如 广东省中山市
    let possibleCounties = matchingCity.childs
    if (!possibleCounties) {
        return {
            missingCounty: false,
            matchingCounty,
            newAddress
        }
    }

    for (const county of possibleCounties) {
        const countyName = county.name
        if (newAddress.includes(countyName)) {
            matchingCounty = county
            newAddress = newAddress.replace(countyName, '')
            return {
                matchingCounty,
                newAddress
            }
        }
    }

    return {
        missingCounty: true,
        matchingCounty,
        newAddress
    }
}

export const getFinalInfo = (
    name = '',
    matchingProvince = null,
    matchingCity = null,
    countyResult
) => {
    const {
        missingCity,
        missingCounty,
        matchingCounty,
        newAddress
    } = countyResult

    let parsedName = name
    let detailedAddress = ''
    let addressSegments = newAddress.split(' ').filter((a) => a)
    const sortedSegmentByLength = [...addressSegments].sort(
        (a, b) => a.length - b.length
    )
    if (!parsedName) {
        const possibleName = sortedSegmentByLength[0] || ''
        if (possibleName.length < 5) {
            parsedName = possibleName
        }
        addressSegments = addressSegments.filter((s) => s !== parsedName)
    }

    if (missingCity || missingCounty) {
        return {
            region: [],
            detailedAddress: '',
            name
        }
    }

    const provinceName = matchingCity.parentName
    const cityName = matchingCity.name
    const countyName = matchingCounty ? matchingCounty.name : null
    const region = [provinceName, cityName, countyName].filter((a) => a)

    detailedAddress = addressSegments.join('')

    return { region, name: parsedName, detailedAddress }
}
