
export default function ({ route, store, redirect }) {
    if (!(store.state.user && !store.state.user.isAdmin)) {
        redirect('/login#' + route.path)
    }
}
