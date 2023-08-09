const Categories = {
    instinct: 0,
    discipline: 1,
    focus: 2
}

const Stats = {
    HEALTH: "health",
    RESILIENCE: "resilience",
    WEAPON_POWER: "weapon-power",
    ABILITY_POWER: "ability-power",
    CRIT_RATING: "crit-rating",
    CRIT_POWER: "crit-power",
    BREAK_POWER: "break-power",
    PHYS_DEFENSE: "phys-defense",
    MAG_DEFENSE: "mag-defense",
    POWER: "power"
}

const statLabels = [
    "Max Health",
    "Resilience",
    "Weapon Power",
    "Ability Power",
    "Crit Rating",
    "Crit Power",
    "Break Power",
    "Phys Defense",
    "Mag Defense",
    "Power"    
]


class ModifierGroup {
    constructor() {
        this.budgetMods = [7.5, 4.5, 1.13, 1.13, 1.13, 1.13, 1.13, 1.88, 1.88];
        this.genericMods = [1, 1, 1, 1, 1, 1, 1, 1, 1];
        this.displayMods = [1, 2, 10, 10, 10, 10, 10, 10, 10];
    }
}

var mods = new ModifierGroup();

class Wayfinder {
    constructor() {
        this.id = 0;
        this.displayName = "";
        this.baseStats = [];
        this.baseStatTotal = 120;
        this.internalStats = [];
        this.affinities = [];
    }
}

var selectedWayfinder = new Wayfinder();
var allWayfinders = [];

class Weapon {
    constructor() {
        this.id = 0;
        this.baseStats = [];
        this.baseStatTotal = 120;
        this.internalStats = [];
        this.affinities = [];
        this.perLevelBudgetIncrease = 0;
        this.perTemperBudgetIncrease = 0;
        this.perRankBudgetIncrease = 0;
    }
}

var selectedWeapon = new Weapon();
var allWeapons = [];

class Accessory {
    constructor() {
        this.id = 0;
        this.baseStats = {};
        this.baseStatCategories = {}; 
    }
}

var selectedAccessories = [];
var allAccessories = [];

class Echo {
    constructor() {
        this.stat = Stats.HEALTH;
        this.value = 0;
        this.cost = 0;
    }
}

var echoList = [];

var beginUpdating = false;

$(document).ready(async function() {
    await loadWayfinderData();
    await loadWeaponData();
    // load accessory data
    // load echo data

   populateDropdowns();
    
    // attach necessary functions to controls
    $('#wayfinder-instinct-affinity').change(fullUpdate);
    $('#wayfinder-discipline-affinity').change(fullUpdate);
    $('#wayfinder-focus-affinity').change(fullUpdate);
    $('#weapon-instinct-affinity').change(fullUpdate);
    $('#weapon-discipline-affinity').change(fullUpdate);
    $('#weapon-focus-affinity').change(fullUpdate);

    fullUpdate();
});

function fullUpdate() {
    updateWayfinderTable();
    updateWeaponTable()
}

async function loadWayfinderData() {
    var wayfinderData;
    await fetch("./json/CharacterInventoryItems.json")
        .then((res) => {
            return res.json();
        })
        .then((data) => wayfinderData = data[0].Rows);

    var numWayfinder = 0;
    for (var wayfinderName in wayfinderData) {
        if (Object.prototype.hasOwnProperty.call(wayfinderData, wayfinderName)) {
            var statData = wayfinderData[wayfinderName].EquipmentData.AttributeBudgetPoints.Entries;
            
            var newWayfinder = new Wayfinder();
            newWayfinder.id = numWayfinder;
            numWayfinder++;
            newWayfinder.displayName = wayfinderData[wayfinderName].DisplayName.Key;
            var baseStatTotal = 0;
            for (let i = 0; i < 9; i++) {
                newWayfinder.baseStats[i] = statData[i].Amount.Value;
                baseStatTotal += newWayfinder.baseStats[i];
            }
            newWayfinder.baseStatTotal = Math.round(baseStatTotal);
            allWayfinders.push(newWayfinder);
        }
    }
}

async function loadWeaponData() {
    var weaponData;
    await fetch("./json/item_weapon.json")
        .then((res) => {
            return res.json();
        })
        .then((data) => weaponData = data);

    var numWeapons = 0;
    for (var weaponName in weaponData) {
        if (Object.prototype.hasOwnProperty.call(weaponData, weaponName)) {
            var newWeapon = new Weapon();
            newWeapon.id = numWeapons;
            numWeapons++;
            newWeapon.displayName = weaponData[weaponName].name;

            var statData = weaponData[weaponName].attributes;
            var statIndex = 0;
            var baseStatTotal = 0;
            for (var statCategory in statData) {
                if (Object.prototype.hasOwnProperty.call(statData, statCategory)) {
                    for (var stat in statData[statCategory]) {
                        if (Object.prototype.hasOwnProperty.call(statData[statCategory], stat)) {
                            newWeapon.baseStats[statIndex] = {
                                value: statData[statCategory][stat],
                                type: stat.toString(),
                                category: statCategory.toString().toLowerCase()
                            }
                            baseStatTotal += newWeapon.baseStats[statIndex].value;
                            statIndex++;
                        }
                    }
                }
            }

            newWeapon.baseStatTotal = Math.round(baseStatTotal);
            allWeapons.push(newWeapon);
        }
    }
}

function populateDropdowns() {
    // populate wayfinder dropdown
    var wayfinderSelect = $("#wayfinder-select");
    wayfinderSelect.on('change', function (e) {
        selectedWayfinder = allWayfinders[this.value]
        fullUpdate();
    });

    for (index in allWayfinders) {
        var wayfinder = allWayfinders[index];
        wayfinderSelect.append(`<option value="${wayfinder.id}">${wayfinder.displayName}</option>`)
    }

    selectedWayfinder = allWayfinders[$("#wayfinder-select").val()];

    // populate weapon dropdown
    var weaponSelect = $("#weapon-select");
    weaponSelect.on('change', function (e) {
        selectedWeapon = allWeapons[this.value];
        fullUpdate();
    });

    for (index in allWeapons) {
        var weapon = allWeapons[index];
        weaponSelect.append(`<option value="${weapon.id}">${weapon.displayName}</option>`)
    }

    selectedWeapon = allWeapons[$("#weapon-select").val()];
    // populate accessory dropdown(s)
}

function updateWayfinderTable() {
    // affinities
    selectedWayfinder.affinities[0] = $('#wayfinder-instinct-affinity').val() ?? 0;
    selectedWayfinder.affinities[1] = $('#wayfinder-discipline-affinity').val() ?? 0;
    selectedWayfinder.affinities[2] = $('#wayfinder-focus-affinity').val() ?? 0;

    // base stats
    var baseStatsTable = $('#wayfinder-base-stats-table').children('tbody');
    baseStatsTable.empty();

    for (i = 0; i < 9; i++) {
        baseStatsTable.append(`
        <tr>
            <td>${statLabels[i]}</td>
            <td class="text-end">${selectedWayfinder.baseStats[i].toFixed(1)}</td>
        </tr>`);
    }
    baseStatsTable.append(`
        <tr>
            <td>${statLabels[9]}</td>
            <td class="text-end">${selectedWayfinder.baseStatTotal}</td>
        </tr>`);

    // internal stats
    var internalStatsTable = $('#wayfinder-internal-stats-table').children('tbody');
    internalStatsTable.empty();    

    for (i = 0; i < 9; i++) {
        var internalStat = selectedWayfinder.baseStats[i] * mods.budgetMods[i] * mods.genericMods[i];
        selectedWayfinder.internalStats[i] = internalStat;
        internalStatsTable.append(`
        <tr>
            <td>x${mods.budgetMods[i]}</td>
            <td>x${mods.genericMods[i]}</td>
            <td class="text-end">${internalStat.toFixed(3)}</td>
        </tr>`);
    }
}

function updateWeaponTable() {
    // affinities
    selectedWeapon.affinities[0] = $('#weapon-instinct-affinity').val() ?? 0;
    selectedWeapon.affinities[1] = $('#weapon-discipline-affinity').val() ?? 0;
    selectedWeapon.affinities[2] = $('#weapon-focus-affinity').val() ?? 0;

    // base stats
    var baseStatsTable = $('#weapon-base-stats-table').children('tbody');
    baseStatsTable.empty();

    for (i = 0; i < selectedWeapon.baseStats.length; i++) {
        var baseStat = selectedWeapon.baseStats[i];
        baseStatsTable.append(`
            <tr>
                <td class="${baseStat.category}">${baseStat.type}</td>
                <td class="text-end">${baseStat.value.toFixed(1)}</td>
            </tr>`);
    }
    baseStatsTable.append(`
        <tr>
            <td>${statLabels[9]}</td>
            <td class="text-end">${selectedWeapon.baseStatTotal}</td>
        </tr>`);

    // internal stats
    var internalStatsTable = $('#weapon-internal-stats-table').children('tbody');
    internalStatsTable.empty();

    for (i = 0; i < selectedWeapon.baseStats.length; i++) {
        var baseStat = selectedWeapon.baseStats[i];

        var totalAffinities = (selectedWayfinder.affinities[Categories[baseStat.category]] + selectedWeapon.affinities[Categories[baseStat.category]])/100;
        var internalStat = baseStat.value * mods.budgetMods[i] * mods.genericMods[i];
        internalStat += (internalStat * totalAffinities);
        selectedWeapon.internalStats[i] = internalStat;
        internalStatsTable.append(`
            <tr>
                <td>x${mods.budgetMods[i]}</td>
                <td>x${mods.genericMods[i]}</td>
                <td class="text-end ${baseStat.category}">${internalStat.toFixed(3)}</td>
            </tr>`);
    }
}

// update accessories table