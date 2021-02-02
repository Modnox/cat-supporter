module.exports = function catsupporter(dispatch) {
    const mapIds = [3104, 3204]
    const config = require('./config.json')
    let enabled = true
    let activePlayers = new Set()
    let partyMembers = new Map()
    let default_fm_mode = config.default_fm_mode
    let mechanic_fm_mode = config.mechanic_fm_mode
    let enable_fm_trigger = config.enable_fm_trigger
    let changed = false;

    dispatch.command.add('cat', (cmd) => {
        switch (cmd) {
            case "default":
                changeFMMode(default_fm_mode)
                break;
            case "mechanic":
                changeFMMode(mechanic_fm_mode)
                break;
            default:
                enabled = !enabled
                dispatch.command.message('catsupporter ' + (enabled ? 'enabled' : 'disabled'))
        }
    })

    dispatch.hook('S_PARTY_MEMBER_LIST', 8, (event) => {
        if (enabled) {
            partyMembers.clear()
            for (let member of event.members) {
                partyMembers.set(member.gameId, member.name)
            }
        }
    })

    dispatch.hook('S_LOAD_TOPO', 3, (event) => {
        if (mapIds.includes(event.zone)) {
            dispatch.command.message('<br> Welcome to the Catalepticon<br>')
        }
    })

    dispatch.hook('S_ABNORMALITY_BEGIN', 4, (event) => {
        if (enabled) {
            if ([31040001, 32040001].includes(event.id)) {
                activePlayers.add(event.target)
                if (activePlayers.size === 2) {
                    activateMarker()
                }
                if (enable_fm_trigger && !changed) {
                    changeFMMode(mechanic_fm_mode)
                    changed = true;
                }
            }
            if (event.id === 32040007) {
                if (partyMembers.has(event.target)) {
                    dispatch.command.message('Eye: ' + partyMembers.get(event.target))
                }
            }
        }

    })
    dispatch.hook('S_ABNORMALITY_END', 1, (event) => {
        if (enabled) {
            if ([31040001, 32040001].includes(event.id)) {
                dispatch.toClient('S_PARTY_MARKER', 1, {marker: [{}]})
                activePlayers.clear()
                if (enable_fm_trigger && changed) {
                    changeFMMode(default_fm_mode)
                    changed = false
                }
            }
        }
    })

    function activateMarker() {
        let players = Array.from(activePlayers)
        dispatch.toClient('S_PARTY_MARKER', 1, {
            markers: [{
                color: 2,
                target: players[0]
            }, {
                color: 2,
                target: players[1]
            }
            ]
        })
    }

    function changeFMMode(mode) {
        dispatch.command.exec('fm m ' + mode)
    }
}