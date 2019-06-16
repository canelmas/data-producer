export let error = (err) => {
    console.error(err)
}

export let info = (msg) => {
    console.info(msg)
}

export let prettyPrint = (json) => {
    info(JSON.stringify(json, null, 4))
}