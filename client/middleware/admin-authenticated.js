/**
 * Created by jim on 6/24/2017.
 */
export default function ({ route, store, redirect }) {
    const isAdmin = (store.state.user && store.state.user.isAdmin)
    const loginPage = route.path === '/adminLogin'

    if (isAdmin) {
        loginPage && redirect('/admin')
    } else {
        !loginPage && redirect('/adminLogin#' + route.path)
    }
}
