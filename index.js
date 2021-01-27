module.exports = function catsupporter(dispatch) {
    const mapIds = [3104, 3204]
    let enabled = false;
    let activePlayers = new Set();

    dispatch.command.add('cat', () => {
        enabled = !enabled
        dispatch.command.message('catsupporter ' + (enabled ? 'enabled' : 'disabled'))
    })

    dispatch.hook('S_LOAD_TOPO', 3, (event) => {
        if (mapIds.includes(event.zone)) {
            dispatch.command.message('<br> Welcome to the Catalepticon<br>');
        }
    });

    dispatch.hook('S_ABNORMALITY_BEGIN', 4, (event) => {
        if (enabled) {
            if ([31040001, 32040001].includes(event.id)) {
                activePlayers.add(event.target)
                if (activePlayers.size === 2) {
                    activateMarker()
                }
            }
        }

    })
    dispatch.hook('S_ABNORMALITY_END', 1, (event) => {
        if (enabled) {
            if ([31040001, 32040001].includes(event.id)) {
                dispatch.toClient('S_PARTY_MARKER', 1, {marker: [{}]});
                activePlayers.clear();
            }
        }
    })

    function activateMarker() {
        let players = Array.from(activePlayers);
        dispatch.toClient('S_PARTY_MARKER', 1, {
            markers: [{
                color: 0,
                target: players[0]
            }, {
                color: 1,
                target: players[1]
            }
            ]
        });
    }
}