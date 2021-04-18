import ShipmentDetail from '../models/shipmentDetail'

export const addShipmentDetail = async (detail, orderId, userId) => {
    await new ShipmentDetail({
        order: orderId,
        information: detail,
        creator: userId
    }).save()
}
