///////////////////////////////////////// MODULES /////////////////////////////////////////
let DataModule = (function () {

// DATA STRUCTURE
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

// CONSTRUCTORS
    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

// FUNCTIONS
    let calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

// ADD ITEM
    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            // CREATE UNIQUE ID
            ID = data.allItems[type].length ?
                data.allItems[type][data.allItems[type].length - 1].id + 1 :
                1;

            // CHECK TYPE OF ADDED ITEM
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // ADD ITEM TO data STRUCTURE
            data.allItems[type].push(newItem);

            return newItem;
        },
        deleteItem: function (id, type) {
            let index, IDs;
            // checks all array and returns array of ids from data.allItems[type]
            IDs = data.allItems[type].map(function (cur) {
                return cur.id;
            });
            // finds element with specified id
            index = IDs.indexOf(id);
            // delete the row
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        calculatePercentage: function () {
            data.allItems.exp.forEach(function (curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            let allPercentage = data.allItems.exp.map(function (curr) {
                return curr.getPercentage();
            });
            return allPercentage;
        },
        test: function () {
            console.log(data);
        }
    }

})();

let UIModule = (function () {

// LABELS MAP
    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    };
    let formatNumber = function (num, type) {
        let numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr((int.length - 3), 3);
        }
        dec = numSplit[1];

        if (type === 'exp') type = '-'; else if (type === 'inc') type = '+'; else type = "";
        return type + ' ' + int + '.' + dec + " PLN";
    };
    let nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,  // INC or EXP
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        getDOMStrings: function () {
            return DOMStrings;
        },
        addListItem: function (obj, type) {
            let element, HTML, newHTML;

            // create HTML string with placeholder text
            if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                HTML = `<div class="item clearfix" id="%id%">
                            <div class="item__description">%description%</div>
                                <div class="right clearfix">
                                    <div class="item__value">%value%</div>
                                        <div class="item__percentage"></div>
                                        <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            }
            else if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                HTML = `<div class="item clearfix" id="%id%">
                            <div class="item__description">%description%</div>
                                <div class="right clearfix">
                                    <div class="item__value">%value%</div>
                                        <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            }

            // replace the placeholder text with some actual data
            newHTML = HTML.replace('%id%', type + '-' + obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // insert html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },
        deleteListItem: function (selectorID) {
            let el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function () {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (cur) {
                cur.value = "";
            });

            fields[0].focus();
        },
        displayBudget: function (obj) {
            let type;
            if (obj.budget > 0) type = 'inc'; else if (obj.budget < 0) type = 'exp'; else type = "";
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";
            }
        },
        displayPercentages: function (percentages) {
            let fields;

            fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        displayMonth: function () {
            let now, month, year, monthsMap;
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();

            monthsMap = ['Styczniu', 'Lutym', 'Marcu', 'Kwietniu', 'Maju', 'Czerwcu', 'Lipcu', 'Sierpniu', 'Wrześniu', 'Październiku', 'Listopadzie', 'Grudniu'];

            document.querySelector(DOMStrings.monthLabel).textContent = monthsMap[month] + ' ' + year;
        },
        changedType: function () {

            let fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.addBtn).classList.toggle('red');
        }
    }
})();

/////////////////////////////////// GLOBAL APP CONTROLLER ///////////////////////////////////
let Controller = (function (DataController, UIController) {

    let setupEventListeners = function () {
        let DOM = UIController.getDOMStrings();
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);
    };

    let updateBudget = function () {
        // 1. Calculate the budget
        DataController.calculateBudget();

        // 2. Return the budget
        let budget = DataController.getBudget();

        // 3. Display the budget on the UI
        UIController.displayBudget(budget);
    };

    let updatePercentage = function () {

        // 1. calculate percentages
        DataController.calculatePercentage();
        // 2. read percentages from budget controller
        let percentages = DataController.getPercentages();
        // 3. update tue UI with the new percentages
        UIController.displayPercentages(percentages);
    };

    let ctrlAddItem = function () {
        let input, newItem;
        // 1. Get the filled input data
        input = UIController.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = DataController.addItem(input.type, input.description, input.value);
            // DataController.test();
            // 3. Add the item to the UI
            UIController.addListItem(newItem, input.type);
            // 4. Clear inputs and focus on description
            UIController.clearFields();
            // 5. calculate and update budget
            updateBudget();
            // 6. update percentages
            updatePercentage();
        }
    };

    let ctrlDeleteItem = function (event) {
        let itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            // 1. delete the item from the data structure
            DataController.deleteItem(id, type);
            // 2. delete the item from the UI
            UIController.deleteListItem(itemID);
            // 3. update and show the bew budget
            updateBudget();
            // 4. update percentages
            updatePercentage();
        }
    };
    return {
        init: function () {
            UIController.displayMonth();
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
})(DataModule, UIModule);
Controller.init();