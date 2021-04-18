import { httpGet } from '~/plugins/axios'

const addressList = []

const formatAddressList = (addressList, parentName = null) => {
    const formattedAddressList = addressList.map((item) => {
        const { childs, name } = item
        if (!childs) {
            return { name, parentName }
        }
        const cleanedChilds = childs.filter(
            (child) => !child.name.includes('郊县')
        )
        const formattedChilds = formatAddressList(cleanedChilds, name)

        // 市辖区
        const isDistrict = formattedChilds[0].name.includes('市辖区')
        return { name, parentName, childs: formattedChilds, isDistrict }
    })
    return formattedAddressList
}

const fetchAddress = async () => {
    const fetchedAddressList = await httpGet('/api/areas?type=1')
    const formattedAddressList = formatAddressList(fetchedAddressList)
    addressList.push(...formattedAddressList)
}

fetchAddress()

export default addressList
