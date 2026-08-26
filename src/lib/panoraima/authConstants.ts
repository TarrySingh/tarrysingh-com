/**
 * Names and paths shared by the middleware, the login routes and the client
 * components. Kept free of secrets and crypto so client bundles can import it
 * without pulling in anything server-side.
 */
export const PANORAIMA_COOKIE = "panoraima_session"
export const PANORAIMA_LOGIN_PATH = "/experiments/panoraima/login"
export const PANORAIMA_LOGOUT_PATH = "/api/panoraima/logout"
