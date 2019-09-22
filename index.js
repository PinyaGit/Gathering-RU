module.exports = function Gathering(mod) {

	const plants = {
		1: {name:'Растение', msg:'Густой кустарник'},
		2: {name:'Растение', msg:'Дикая кукуруза'},
		3: {name:'Растение', msg:'Веридия'},
		4: {name:'Растение', msg:'Кадмильский гриб'},
		5: {name:'Растение', msg:'Старая тыква'},
		6: {name:'Растение', msg:'Яблоня'}
	}
	const mining = {
		101: {name:'Руда', msg:'Валун'},
		102: {name:'Руда', msg:'Кобаловая руда'},
		103: {name:'Руда', msg:'Шадметаллическая руда'},
		104: {name:'Руда', msg:'Зерметаллическая руда'},
		105: {name:'Руда', msg:'Норметаллическая руда'},
		106: {name:'Руда', msg:'Галенит'}
	}
	const energy = {
		201: {name:'Энергия', msg:'Бесцветный кристалл'},
		202: {name:'Энергия', msg:'Красный кристалл'},
		203: {name:'Энергия', msg:'Зеленый кристалл'},
		204: {name:'Энергия', msg:'Голубой кристалл'},
		205: {name:'Энергия', msg:'Белый кристалл'},
		206: {name:'Энергия', msg:'Зараженный цветок'}
	}

	let {
		enabled,
		sendToAlert,
		sendToNotice,
	} = require('./config.json')

	let plantsMarkers = false,
		miningMarkers = false,
		energyMarkers = false,
		othersMarkers = false,
		mobid = []

	mod.command.add('сбор', (arg) => {
		if (!arg) {
			enabled = !enabled;
			if (!enabled) {
				plantsMarkers = false
				miningMarkers = false
				energyMarkers = false
				for (let itemId of mobid) {
					despawnItem(itemId)
				}
			}
			sendMessage('Модуль ' + (enabled ? BLU('Вкл') : YEL('Выкл')))
		} else {
			switch (arg) {
				case "предупреждение":
					sendToAlert = !sendToAlert
					sendMessage('Warning ' + (sendToAlert ? BLU('Enable') : YEL('Disable')))
					break
				case "уведомление":
					sendToNotice = !sendToNotice
					sendMessage('Notification ' + (sendToNotice ? BLU('Enable') : YEL('Disable')))
					break

				case "статус":
					gatheringStatus()
					break

				case "растения":
					plantsMarkers = !plantsMarkers
					sendMessage('Растения' + (plantsMarkers ? BLU('Отображается') : YEL('Скрыто')))
					break
				case "руда":
					miningMarkers = !miningMarkers
					sendMessage('Руда' + (miningMarkers ? BLU('Отображается') : YEL('Скрыто')))
					break
				case "энергия":
					energyMarkers = !energyMarkers
					sendMessage('Энергия' + (energyMarkers ? BLU('Отображается') : YEL('Скрыто')))
					break

				default :
					sendMessage(RED('Недействительный аргумент!'))
					break
			}
		}
	})

	mod.hook('S_LOAD_TOPO', 3, (event) => {
		mobid = []
	})

	mod.hook('S_SPAWN_COLLECTION', 4, (event) => {
		if (enabled) {
			if (plantsMarkers && plants[event.id]) {
				alertMessage('Найдено [' + plants[event.id].name + '] ' + plants[event.id].msg)
				noticeMessage('Найдено [' + plants[event.id].name + '] ' + plants[event.id].msg)
			}
			else if (miningMarkers && mining[event.id]) {
				alertMessage('Найдено [' + mining[event.id].name + '] ' + mining[event.id].msg)
				noticeMessage('Найдено [' + mining[event.id].name + '] ' + mining[event.id].msg)
			}
			else if (energyMarkers && energy[event.id]) {
				alertMessage('Найдено [' + energy[event.id].name + '] ' + energy[event.id].msg)
				noticeMessage('Найдено [' + energy[event.id].name + '] ' + energy[event.id].msg)
			}
			else {
				return true
			}
			spawnItem(event.gameId, event.loc)
			mobid.push(event.gameId)
		}
	})

	mod.hook('S_DESPAWN_COLLECTION', 2, (event) => {
		if (mobid.includes(event.gameId)) {
			despawnItem(event.gameId)
			mobid.splice(mobid.indexOf(event.gameId), 1)
		}
	})

	function spawnItem(gameId, loc) {
		loc.z = loc.z - 100
		mod.send('S_SPAWN_DROPITEM', 6, {
			gameId: gameId*100n,
			loc: loc,
			item: 98260,
			amount: 1,
			expiry: 999999,
			owners: [{
				id: 0
			}]
		})
	}

	function despawnItem(gameId) {
		mod.send('S_DESPAWN_DROPITEM', 4, {
			gameId: gameId*100n
		})
	}

	function alertMessage(msg) {
		if (sendToAlert) {
			mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
				type: 43,
				chat: 0,
				channel: 0,
				message: msg
			})
		}
	}

	function noticeMessage(msg) {
		if (sendToNotice) {
			mod.send('S_CHAT', 2, {
				channel: 25,
				authorName: 'collection',
				message: msg
			})
		}
	}

	function gatheringStatus() {
		sendStatus(
			`Module : ${enabled ? BLU('Вкл') : YEL('Выкл')}`,
			`Warning : ${sendToAlert ? BLU('Вкл') : YEL('Выкл')}`,
			`Notification : ${sendToNotice ? BLU('Вкл') : YEL('Выкл')}`,

			`Поиск Растений : ${plantsMarkers ? BLU('Отображается') : YEL('Скрыто')}`,
			`Поиск Руды : ${miningMarkers ? BLU('Отображается') : YEL('Скрыто')}`,
			`Поиск Энергии : ${energyMarkers ? BLU('Отображается') : YEL('Скрыто')}`
		)
	}

	function sendStatus(msg) {
		mod.command.message([...arguments].join('\n\t - '))
	}

	function sendMessage(msg) {
		mod.command.message(msg)
	}

	function BLU(bluetext) {
		return '<font color="#56B4E9">' + bluetext + '</font>'
	}

	function YEL(yellowtext) {
		return '<font color="#E69F00">' + yellowtext + '</font>'
	}

	function RED(redtext) {
		return '<font color="#FF0000">' + redtext + '</font>'
	}

}
