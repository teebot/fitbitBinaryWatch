let clock = {
    ontick: () => { }
}
export default clock

window.setInterval(() => {
    if (!clock.ontick) throw new Error('No ontick handler')

    clock.ontick({ date: new Date() })
}, 1000)