export const addSessionStorage = (user) => {
    sessionStorage.setItem('user', JSON.stringify(user))
}

export const getSessionStorage = () => {
    return JSON.parse(sessionStorage.getItem('user'))
}
