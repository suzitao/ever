/**
 * Created by jim on 6/25/2017.
 */
import { extend } from './util'
import mongoose from 'mongoose'
/**
 * 通用列表查询
 * @param model
 * @param queryObject
 * @param sort
 * @param pageNo
 * @param pageSize
 * @returns {Promise.<{list: [], total: number}>}
 */
export async function queryList ({
    model,
    query,
    sort,
    select,
    populate,
    pageNo = 1,
    pageSize = 15,
    projection = {},
    beforeQuery
}) {
    let q = model.find(query, projection)
    if (sort) {
        q.sort(sort)
    }
    if (select) {
        q.select(select)
    }
    if (populate) {
        q.populate(populate)
    }
    if (beforeQuery) {
        const promise = beforeQuery(q)
        if (promise && typeof promise.then === 'function') {
            await promise
        }
    }
    q = q.skip((pageNo - 1) * pageSize).limit(pageSize)
    const startTime = new Date().getTime()
    const [list, total] = await Promise.all([
        q.exec(),
        model.countDocuments(query)
    ])
    const finishTime = new Date().getTime()
    const timeUsed = finishTime - startTime
    const dbTime = `query: pageNo=${pageNo}/pageSize=${pageSize}/startTime=${startTime}/finishTime=${finishTime}/timeUsed=${timeUsed}ms`
    return { list, total, dbTime }
}

export async function queryList2 (model, req, opts = {}) {
    const query = req.query
    query.sort = JSON.parse(query.sort)
    let sort = {}
    if (query.sort) {
        extend(sort, query.sort)
    }
    if (opts.sort) {
        for (let name in opts.sort) {
            if (query.sort[name]) {
                delete opts.sort[name]
            }
        }
        extend(sort, opts.sort)
    }

    return queryList({
        model: model,
        pageNo: parseInt(query.pageNo) || 0,
        pageSize: parseInt(query.pageSize) || 15,
        ...opts,
        sort
    })
}

export const getObjectId = id => {
    return typeof id === 'string' ? mongoose.Types.ObjectId(id) : id
}

export const convertObjectIdToString = id => {
    return mongoose.Types.ObjectId(id).toString()
}
