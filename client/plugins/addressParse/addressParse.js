import {
    cleanAddress,
    filterId,
    filterPhone,
    filterPostalCode,
    getNameByKeyword,
    stripKeyWords,
    getProvince,
    getCity,
    getCounty,
    getFinalInfo
} from './utilities'

const addressParse = (addressToParse) => {
    let newAddress = cleanAddress(addressToParse)

    const resultId = filterId(newAddress)
    const id = resultId.id
    newAddress = resultId.newAddress

    const resultPhone = filterPhone(newAddress)
    const phone = resultPhone.phone
    newAddress = resultPhone.newAddress

    const resultPostalCode = filterPostalCode(newAddress)
    const postalCode = resultPostalCode.postalCode
    newAddress = resultPostalCode.newAddress

    const resultKeywordName = getNameByKeyword(newAddress)
    let name = resultKeywordName.name
    newAddress = stripKeyWords(resultKeywordName.newAddress)

    const provinceResult = getProvince(newAddress)
    let matchingProvince = provinceResult.matchingProvince
    newAddress = provinceResult.newAddress

    const cityResult = getCity(newAddress, matchingProvince)
    let matchingCity = cityResult.matchingCity
    newAddress = cityResult.newAddress

    const countyResult = getCounty(newAddress, matchingCity)
    newAddress = countyResult.newAddress
    const finalInfo = getFinalInfo(
        name,
        matchingProvince,
        matchingCity,
        countyResult
    )

    return {
        id,
        phone,
        postalCode,
        ...finalInfo
    }
}

export default addressParse
