import { Permission, PermissionItem } from '../models'

export const validatePermission = async (req, permissionItemNumber) => {
    if (req.user.isAdministrator) return
    const permissionItem = await PermissionItem.findOne({ permissionItemNumber })
    if (!permissionItem) throw new Error(`没有编码为${permissionItemNumber}的权限项！`)
    const permission = await Permission.findOne({ user: req.user._id, branch: req.session.currentBranchId })
    if (!permission) throw new Error(`你没有${permissionItem.name}的权限！`)
    let pass = false
    permission.permissionItems.map(permissionItemId => {
        if (permissionItemId.toString() === permissionItem._id.toString()) pass = true
    })
    if (!pass) throw new Error(`你没有${permissionItem.name}的权限！`)
}
