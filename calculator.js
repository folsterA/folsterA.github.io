const Categories = {
    instinct: 0,
    discipline: 1,
    focus: 2
}

const Stats = {
    "Max Health": 0,
    "Resilience": 1,
    "Weapon Power": 2,
    "Ability Power": 3,
    "Crit Rating": 4,
    "Crit Power": 5,
    "Break Power": 6,
    "Phys Defense": 7,
    "Mag Defense": 8
}

const StatTypes = [
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
        this.budgetMods = {
            "Max Health": 7.5,
            "Resilience": 4.5,
            "Weapon Power": 1.125,
            "Ability Power": 1.125,
            "Crit Rating": 1.125,
            "Crit Power": 1.125,
            "Break Power": 1.125,
            "Phys Defense": 1.875,
            "Mag Defense": 1.875
        };
        this.genericMods = {
            "Max Health": 1.0,
            "Resilience": 1.0,
            "Weapon Power": 1.0,
            "Ability Power": 1.0,
            "Crit Rating": 1.0,
            "Crit Power": 1.0,
            "Break Power": 1.0,
            "Phys Defense": 1.0,
            "Mag Defense": 1.0
        };
        this.displayMods = {
            "Max Health": 1.0,
            "Resilience": 2.0,
            "Weapon Power": 10.0,
            "Ability Power": 10.0,
            "Crit Rating": 10.0,
            "Crit Power": 10.0,
            "Break Power": 10.0,
            "Phys Defense": 10.0,
            "Mag Defense":10.0
        };
    }
}

var mods = new ModifierGroup();

class Wayfinder {
    constructor() {
        this.id = 0;
        this.name = "";
        this.level = 1;
        this.powerLevel = 120;
        this.awakening = 0;
        this.baseStats = {};
        this.internalStats = {};
        this.displayStats = {};
        this.baseStatTotal = 120;
        this.affinities = {};
        this.levelIncrease = 0;
        this.rankIncrease = 0;
    }
}

var selectedWayfinder = new Wayfinder();
var allWayfinders = [];

class Weapon {
    constructor() {
        this.id = 0;
        this.name = "";
        this.level = 1;
        this.powerLevel = 0;
        this.reinforcements = 0;
        this.temper = 0;
        this.baseStats = {};
        this.internalStats = {};
        this.displayStats = {};
        this.baseStatTotal = 120;
        this.affinities = {};
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
        this.name = "";
        this.level = 1;
        this.powerLevel;
        this.baseStats = {};
        this.baseStatTotal = 120;
        this.internalStats = {};
        this.displayStats = {};
        this.perLevelBudgetIncrease = 0;
    }
}

var selectedAccessories = [];
var allAccessories = [];

class Echo {
    constructor() {
        this.stat = "";
        this.value = 0;
        this.cost = 0;
    }
}

var echoList = [];

var beginUpdating = false;

$(document).ready(async function () {

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    
    // grab modifier data    

    await loadWayfinderData();
    await loadWeaponData();
    await loadAccessoryData();
    // load echo data

    populateDropdowns();

    attachControls();

    fullUpdate();
});

function fullUpdate() {
    updateWayfinderTables();
    updateWeaponTables()
    updateAccessoryTables();
    updateTotals();
}

async function loadWayfinderData() {
    var wayfinderData;
    await fetch("./json/character_wayfinder.json")
        .then((res) => {
            return res.json();
        })
        .then((data) => wayfinderData = data);

    var numWayfinder = 0;
    for (var wayfinderName in wayfinderData) {
        if (Object.prototype.hasOwnProperty.call(wayfinderData, wayfinderName)) {
            var wayfinder = wayfinderData[wayfinderName];
            var newWayfinder = new Wayfinder();

            // attributes
            newWayfinder.id = numWayfinder;
            numWayfinder++;
            newWayfinder.name = wayfinder.name;
            newWayfinder.levelIncrease = wayfinder.attributeAutoScalingData.PerLevelBudgetIncrement;
            newWayfinder.rankIncrease = wayfinder.attributeAutoScalingData.PerRankBudgetIncrements;

            // stats
            var statData = wayfinder.attributes;
            newWayfinder.baseStatTotal = 0;

            for (var statType in statData) {
                if (Object.prototype.hasOwnProperty.call(statData, statType)) {
                    newWayfinder.baseStats[statType] = statData[statType];
                    newWayfinder.baseStatTotal += newWayfinder.baseStats[statType];
                }
            }

            newWayfinder.baseStatTotal = Math.round(newWayfinder.baseStatTotal);
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
            var weapon = weaponData[weaponName];
            var newWeapon = new Weapon();

            // attribute
            newWeapon.id = numWeapons;
            numWeapons++;
            newWeapon.name = weapon.name == "" || weapon.name == null ? weaponName.toString() : weapon.name;
            var attributeScaling = weapon.attributeAutoScalingData;
            newWeapon.perLevelBudgetIncrease = attributeScaling.PerLevelBudgetIncrement;
            newWeapon.perTemperBudgetIncrease = attributeScaling.PerTemperBudgetIncrements;
            newWeapon.perRankBudgetIncrease = attributeScaling.PerRankBudgetIncrements;
            newWeapon.baseStatTotal = 0;
            
            //stats
            var statData = weaponData[weaponName].attributes;
            var statAffinities = weaponData[weaponName].affinities;
            for (var statCategory in statAffinities) {
                if (Object.prototype.hasOwnProperty.call(statAffinities, statCategory)) {
                    for (var index in statAffinities[statCategory]) {
                        var statType = statAffinities[statCategory][index];
                        newWeapon.baseStats[statType] = {
                            value: statData[statType],
                            category: statCategory.toString()
                        }

                        newWeapon.baseStatTotal += newWeapon.baseStats[statType].value;                        
                    }
                }
            }

            allWeapons.push(newWeapon);
        }
    }
}

async function loadAccessoryData() {
    // var weaponData;
    var accessoryData;
    await fetch("./json/item_accessory.json")
        .then((res) => {
            return res.json();
        })
        .then((data) => accessoryData = data);

    var numAccessories = 0;
    for (var accessoryName in accessoryData) {
        if (Object.prototype.hasOwnProperty.call(accessoryData, accessoryName)) {
            var accessory = accessoryData[accessoryName];
            var newAccessory = new Accessory();

            // attributes
            newAccessory.id = numAccessories;
            numAccessories++;
            newAccessory.name = accessory.name == "" || accessory.name == null ? accessoryName.toString() : accessory.name;
            newAccessory.perLevelBudgetIncrease = accessory.attributeAutoScalingData.PerLevelBudgetIncrement;
            newAccessory.baseStatTotal = 0;
            
            var statData = accessory.attributes;
            var statAffinities = accessory.affinities;
            for (var statCategory in statAffinities) {
                if (Object.prototype.hasOwnProperty.call(statAffinities, statCategory)) {
                    for (var index in statAffinities[statCategory]) {
                        var statType = statAffinities[statCategory][index];
                        newAccessory.baseStats[statType] = {
                            value: statData[statType],
                            category: statCategory.toString()
                        }

                        newAccessory.baseStatTotal += newAccessory.baseStats[statType].value;                        
                    }
                }
            }

            allAccessories.push(newAccessory);
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
        wayfinderSelect.append(`<option value="${wayfinder.id}">${wayfinder.name}</option>`)
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
        weaponSelect.append(`<option value="${weapon.id}">${weapon.name}</option>`)
    }

    selectedWeapon = allWeapons[$("#weapon-select").val()];

    // populate accessory dropdown(s)
    for (i = 0; i < 3; i++) {
        var accessorySelect = $(`#accessory${i}-select`);

        accessorySelect.on('change', function (e) {
            switch (this.id) {
                case "accessory0-select":
                    selectedAccessories[0] = allAccessories[this.value];
                    break;
                case "accessory1-select":
                    selectedAccessories[1] = allAccessories[this.value];
                    break;
                case "accessory2-select":
                    selectedAccessories[2] = allAccessories[this.value];
                    break;
                default:
                    break;
            }
            fullUpdate();
        });

        for (index in allAccessories) {
            var accessory = allAccessories[index];
            // if (selectedAccessories[(i + 1) % 3].id == index
            //     || selectedAccessories[(i + 2) % 3].id == index) {
            //     continue;
            // }
            accessorySelect.append(`<option value="${accessory.id}">${accessory.name}</option>`)
        }

        selectedAccessories[i] = allAccessories[$("#weapon-select").val()];
    }
}

function attachControls() {
    // affinity pickers
    $('#wayfinder-instinct-affinity').change(fullUpdate);
    $('#wayfinder-discipline-affinity').change(fullUpdate);
    $('#wayfinder-focus-affinity').change(fullUpdate);
    $('#weapon-instinct-affinity').change(fullUpdate);
    $('#weapon-discipline-affinity').change(fullUpdate);
    $('#weapon-focus-affinity').change(fullUpdate);

    // attributes
    $('#wayfinder-level').change(fullUpdate);
    $('#wayfinder-awakening').change(fullUpdate);
    $('#weapon-level').change(fullUpdate);
    $('#weapon-reinforcement').change(fullUpdate);
    $('#weapon-temper').change(fullUpdate);
    $(`#accessory0-level`).change(fullUpdate);
    $(`#accessory1-level`).change(fullUpdate);
    $(`#accessory2-level`).change(fullUpdate);
}

function updateWayfinderTables() {
    // attributes
    selectedWayfinder.level = $('#wayfinder-level').val() === "" ? 1 : parseInt($('#wayfinder-level').val());
    selectedWayfinder.awakening = $('#wayfinder-awakening').val() === "" ? 0 : parseInt($('#wayfinder-awakening').val());
    $('#wayfinder-at-level-label').text(`@ Level ${selectedWayfinder.level}`);

    // affinities
    selectedWayfinder.affinities["Instinct"] = $('#wayfinder-instinct-affinity').val() === "" ? 0 : parseInt($('#wayfinder-instinct-affinity').val());
    selectedWayfinder.affinities["Discipline"] = $('#wayfinder-discipline-affinity').val() === "" ? 0 : parseInt($('#wayfinder-discipline-affinity').val());
    selectedWayfinder.affinities["Focus"] = $('#wayfinder-focus-affinity').val() === "" ? 0 : parseInt($('#wayfinder-focus-affinity').val());

    selectedWayfinder.powerLevel = selectedWayfinder.baseStatTotal + selectedWayfinder.levelIncrease * (selectedWayfinder.level + selectedWayfinder.awakening - 1);

    var baseStatsTable = $('#wayfinder-base-stats-table').children('tbody');
    baseStatsTable.empty();

    var internalStatsTable = $('#wayfinder-internal-stats-table').children('tbody');
    internalStatsTable.empty();

    var displayStatsTable = $('#wayfinder-display-stats-table').children('tbody');
    displayStatsTable.empty();


    for (var statType in Stats) {
        // base stats
        baseStatsTable.append(`
            <tr>
                <td>${statType}</td>
                <td class="text-end">${selectedWayfinder.baseStats[statType].toFixed(1)}</td>
            </tr>`);

        // internal stats
        var ratio = selectedWayfinder.baseStats[statType] / selectedWayfinder.baseStatTotal;
        selectedWayfinder.internalStats[statType] = ratio * selectedWayfinder.powerLevel * mods.budgetMods[statType] * mods.genericMods[statType];

        internalStatsTable.append(`
            <tr>
                <td>x${mods.budgetMods[statType]}</td>
                <td>x${mods.genericMods[statType]}</td>
                <td class="text-end">${selectedWayfinder.internalStats[statType].toFixed(3)}</td>
            </tr>`);

        // display stats
        selectedWayfinder.displayStats[statType] = Math.round(selectedWayfinder.internalStats[statType] * mods.displayMods[statType]);
        
        displayStatsTable.append(`
            <tr>
                <td>x${mods.displayMods[statType]}</td>
                <td class="text-end">${selectedWayfinder.displayStats[statType]}</td>
            </tr>`);

    }

    baseStatsTable.append(`
        <tr>
            <td>${StatTypes[9]}</td>
            <td class="text-end">${selectedWayfinder.baseStatTotal}</td>
        </tr>`);

    internalStatsTable.append(`
        <tr>
            <td></td>
            <td></td>
            <td class="text-end">${selectedWayfinder.powerLevel.toFixed(3)}</td>
        </tr>`);

    displayStatsTable.append(`
        <tr>
            <td></td>
            <td class="text-end">${Math.round(selectedWayfinder.powerLevel)}</td>
        </tr>`);

}

function updateWeaponTables() {
    // attributes
    selectedWeapon.level = $('#weapon-level').val() === "" ? 1 : parseInt($('#weapon-level').val());
    selectedWeapon.reinforcements = $('#weapon-reinforcement').val() === "" ? 0 : parseInt($('#weapon-reinforcement').val());
    selectedWeapon.temper = $('#weapon-temper').val() === "" ? 0 : parseInt($('#weapon-temper').val());
    $('#weapon-at-level-label').text(`@ Level ${selectedWayfinder.level}`);

    // affinities
    selectedWeapon.affinities["Instinct"] = $('#weapon-instinct-affinity').val() === "" ? 0 : parseInt($('#weapon-instinct-affinity').val());
    selectedWeapon.affinities["Discipline"] = $('#weapon-discipline-affinity').val() === "" ? 0 : parseInt($('#weapon-discipline-affinity').val());
    selectedWeapon.affinities["Focus"] = $('#weapon-focus-affinity').val() === "" ? 0 : parseInt($('#weapon-focus-affinity').val());

    selectedWeapon.powerLevel = selectedWeapon.baseStatTotal + (selectedWeapon.perLevelBudgetIncrease * (selectedWeapon.level - 1))
        + (selectedWeapon.perTemperBudgetIncrease * (selectedWeapon.temper))
        + (selectedWeapon.perRankBudgetIncrease * (selectedWeapon.reinforcements));

    var baseStatsTable = $('#weapon-base-stats-table').children('tbody');
    baseStatsTable.empty();

    var internalStatsTable = $('#weapon-internal-stats-table').children('tbody');
    internalStatsTable.empty();
    
    var displayStatsTable = $('#weapon-display-stats-table').children('tbody');
    displayStatsTable.empty();
    
    for (statType in selectedWeapon.baseStats) {
        // base stats
        var baseStat = selectedWeapon.baseStats[statType];
        baseStatsTable.append(`
            <tr>
                <td class="${baseStat.category.toLowerCase()}">${statType}</td>
                <td class="text-end">${baseStat.value.toFixed(1)}</td>
            </tr>`);

        // internal stats
        var totalAffinities = parseInt(selectedWayfinder.affinities[baseStat.category]) + parseInt(selectedWeapon.affinities[baseStat.category]);
        totalAffinities /= 100;

        var ratio = baseStat.value / selectedWeapon.baseStatTotal;
        selectedWeapon.internalStats[statType] = ratio * selectedWeapon.powerLevel * mods.budgetMods[statType] * mods.genericMods[statType];
        selectedWeapon.internalStats[statType] += (selectedWeapon.internalStats[statType] * totalAffinities);

        internalStatsTable.append(`
            <tr>
                <td>x${mods.budgetMods[statType]}</td>
                <td>x${mods.genericMods[statType]}</td>
                <td class="text-end ${baseStat.category.toLowerCase()}">${selectedWeapon.internalStats[statType].toFixed(3)}</td>
            </tr>`);

        // display stats
        selectedWeapon.displayStats[statType] = Math.round(selectedWeapon.internalStats[statType] * mods.displayMods[statType]);
        displayStatsTable.append(`
            <tr>
                <td>x${mods.displayMods[statType]}</td>
                <td class="text-end ${baseStat.category.toLowerCase()}">${(selectedWeapon.displayStats[statType])}</td>
            </tr>`);

    }

    baseStatsTable.append(`
        <tr>
            <td>${StatTypes[9]}</td>
            <td class="text-end">${selectedWeapon.baseStatTotal.toFixed(2)}</td>
        </tr>`);

    internalStatsTable.append(`
        <tr>
            <td></td>
            <td></td>
            <td class="text-end">${selectedWeapon.powerLevel.toFixed(2)}</td>
        </tr>`);

    displayStatsTable.append(`
        <tr>
            <td></td>
            <td class="text-end">${Math.round(selectedWeapon.powerLevel)}</td>
        </tr>`);
}

function updateAccessoryTables() {
    for (j = 0; j < 3; j++) {
        var selectedAccessory = selectedAccessories[j];

        // attributes
        selectedAccessory.level = $(`#accessory${j}-level`).val() === "" ? 1 : $(`#accessory${j}-level`).val();

        // display stats
        var displayStatsTable = $(`#accessory${j}-display-stats-table`).children('tbody');
        displayStatsTable.empty();

        selectedAccessory.powerLevel = selectedAccessory.baseStatTotal + (selectedAccessory.perLevelBudgetIncrease * (selectedAccessory.level - 1));

        for (var statType in selectedAccessory.baseStats) {
            var baseStat = selectedAccessory.baseStats[statType];

            var totalAffinities = selectedWayfinder.affinities[baseStat.category] / 100;

            var ratio = baseStat.value / selectedAccessory.baseStatTotal;

            selectedAccessory.internalStats[statType] = ratio * selectedAccessory.powerLevel * mods.budgetMods[statType] * mods.genericMods[statType];
            selectedAccessory.internalStats[statType] += (selectedAccessory.internalStats[statType] * totalAffinities);

            selectedAccessory.displayStats[statType] = Math.round(selectedAccessory.internalStats[statType] * mods.displayMods[statType]);

            displayStatsTable.append(`
                <tr>
                    <td class="${baseStat.category.toLowerCase()}">${statType}</td>
                    <td class="text-end">${(selectedAccessory.displayStats[statType])}</td>
                </tr>`);
        }

        displayStatsTable.append(`
            <tr>
                <td>${StatTypes[9]}</td>
                <td class="text-end">${Math.round(selectedAccessory.powerLevel)}</td>
            </tr>`);
    }

}

function updateTotals() {
    var totalsTable = $(`#total-stats-table`).children('tbody');
    totalsTable.empty();

    var totalOtherStats = {
        "Max Health": 0,
        "Resilience": 0,
        "Weapon Power": 0,
        "Ability Power": 0,
        "Crit Rating": 0,
        "Crit Power": 0,
        "Break Power": 0,
        "Phys Defense": 0,
        "Mag Defense": 0
    };

    var totalStats = {
        "Max Health": 0,
        "Resilience": 0,
        "Weapon Power": 0,
        "Ability Power": 0,
        "Crit Rating": 0,
        "Crit Power": 0,
        "Break Power": 0,
        "Phys Defense": 0,
        "Mag Defense": 0
    };

    // power level
    var totalPowerLevel = 0;
    var totalOtherPowerLevel = 0;
    totalPowerLevel += selectedWayfinder.powerLevel;
    totalPowerLevel += selectedWeapon.powerLevel;
    for (j = 0; j < 3; j++) {
        totalOtherPowerLevel += selectedAccessories[j].powerLevel;
        totalPowerLevel += selectedAccessories[j].powerLevel;
    }

    for (statType in Stats) {
        // add up accessories stats
        for (j = 0; j < 3; j++) {
            if (selectedAccessories[j].displayStats[statType] != null) {
                console.log(statType + " " + selectedAccessories[j].displayStats[statType]);
                totalOtherStats[statType] += selectedAccessories[j].displayStats[statType];
            }
        }

        // wayfinder stats
        var appendString = `<tr><td>${statType}</td><td>${selectedWayfinder.displayStats[statType]}</td>`
        totalStats[statType] += selectedWayfinder.displayStats[statType];

        // weapon stats        
        if (selectedWeapon.baseStats[statType] != null) {
            appendString += `<td>${selectedWeapon.displayStats[statType]}</td>`
            totalStats[statType] += selectedWeapon.displayStats[statType];
        } else  {
            appendString += "<td>0</td>";
        }

        // other stats
        if (totalOtherStats[statType] != null) {
            appendString += `<td>${totalOtherStats[statType]}</td>`;
            totalStats[statType] += totalOtherStats[statType];
        } else {
            appendString += "<td>0</td>";
        }

        // total stats
        appendString += `<td class="text-end">${totalStats[statType]}</td>`

        appendString += "</tr>";
        totalsTable.append(appendString);
    }

    totalsTable.append(`
    <tr>
        <td>Power Level</td>
        <td>${Math.round(selectedWayfinder.powerLevel)}</td>
        <td>${Math.round(selectedWeapon.powerLevel)}</td>
        <td>${Math.round(totalOtherPowerLevel)}</td>
        <td class="text-end">${Math.round(totalPowerLevel)}</td>
    </tr>
    `);
}