const Cateogries = {
    INSTINCT: 0,
    DISCIPLINE: 1,
    FOCUS: 2
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
        this.affinties = [];
    }
}

var selectedWayfinder = new Wayfinder();
var allWayfinders = [];

class Weapon {
    constructor() {
        this.id = 0;
        this.baseStats = [];
        this.baseStatTotal = 120;
        this.affinties = [];
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

    updateWayfinderTable(0);
    updateWeaponTable(0);
    updateAccessories();
    totalStats();
});

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
        updateWayfinderTable(this.value);
    });

    for (index in allWayfinders) {
        var wayfinder = allWayfinders[index];
        wayfinderSelect.append(`<option value="${wayfinder.id}">${wayfinder.displayName}</option>`)
    }

    // populate weapon dropdown
    var weaponSelect = $("#weapon-select");
    weaponSelect.on('change', function (e) {
        console.log(this);
        updateWeaponTable(this.value);
    });

    for (index in allWeapons) {
        var weapon = allWeapons[index];
        weaponSelect.append(`<option value="${weapon.id}">${weapon.displayName}</option>`)
    }

    // populate accessory dropdown(s)
}

function updateWayfinderTable(index) {
    selectedWayfinder = allWayfinders[index];

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

    var internalStats;
    for (i = 0; i < 9; i++) {
        internalStats = selectedWayfinder.baseStats[i] * mods.budgetMods[i] * mods.genericMods[i];
        internalStatsTable.append(`
        <tr>
            <td>x${mods.budgetMods[i]}</td>
            <td>x${mods.genericMods[i]}</td>
            <td class="text-end">${internalStats.toFixed(3)}</td>
        </tr>`);
    }
}

function updateWeaponTable(index) {
    selectedWeapon = allWeapons[index];
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

    var internalStats;
    for (i = 0; i < selectedWeapon.baseStats.length; i++) {
        // MORE SHIT NEEDED HERE
        var baseStat = selectedWeapon.baseStats[i];
        internalStats = baseStat.value * mods.budgetMods[i] * mods.genericMods[i];
        internalStatsTable.append(`
            <tr>
                <td>x${mods.budgetMods[i]}</td>
                <td>x${mods.genericMods[i]}</td>
                <td class="text-end ${baseStat.category}">${internalStats.toFixed(3)}</td>
            </tr>`);
    }
}

// update accessories table
function updateAccessories(tableNumber) {
    return tableNumber;
}

// add an echo to the echo list
function addEcho() {

}

// delete an echo from the echo list
function removeEcho() {

}

// total up all stats
function totalStats() {

}