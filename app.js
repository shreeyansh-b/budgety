var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type){
        var sum = 0;
        data.allitems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    var data = {
        allitems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    return {
        addItem: function(type, des, val){
            var newItem, ID;

            if(data.allitems[type].length > 0){
                ID = data.allitems[type][data.allitems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }

            if(type === "exp"){
                newItem = new Expense(ID, des, val);
            }else if(type === "inc"){
                newItem = new Income(ID, des, val);
            }
            data.allitems[type].push(newItem);
            return newItem;
        },
        calculateBudget: function() {
            calculateTotal("inc");
            calculateTotal("exp");
            data.budget = data.totals["inc"] - data.totals["exp"];
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
            }else{
                data.percentage = -1;
            }
            
        },
        calculatePercentages: function(){
            data.allitems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function(){
            var allPerc = data.allitems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        deleteItem: function(type, id){
            var ids, index;
            ids = data.allitems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if( index !== -1){
                data.allitems[type].splice(index, 1);
            }
        },
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing : function(){
            console.log(data);
        }
    }

})();

var UIController = (function(){


    var DOMstrings = {
        inputType: ".add__type",
        inputValue: ".add__value",
        inputDescription: ".add__description",
        inputBtn: ".add__btn",
        expenseList: ".expenses__list",
        incomeList: ".income__list",
        budgetLabel: ".budget__value",
        incLabel: ".budget__income--value",
        expLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expenesePercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };
    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; ++i){
            callback(list[i], i);
        }
    };

    return{
        getDOMStrings: function(){
            return DOMstrings;
        },
        getInput: function() {
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj, type){
            var html, element, newHtml;
            if(type === "exp"){
                element = DOMstrings.expenseList;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div><div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === "inc"){
                element = DOMstrings.incomeList;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%value%", this.formatNumber(obj.value, type));
            newHtml = newHtml.replace("%description%", obj.description);

            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
            
        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, arrFields;
            fields = document.querySelectorAll(DOMstrings.inputDescription + "," + DOMstrings.inputValue);
            arrFields = Array.prototype.slice.call(fields);
            arrFields.forEach(function(current, index, array){
                current.value = "";
            });

            arrFields[0].focus();
        },
        displayBudget: function(obj){
            obj.budget > 0 ? type = "inc" : type = "exp"; 
            document.querySelector(DOMstrings.budgetLabel).textContent = this.formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incLabel).textContent = this.formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expLabel).textContent = this.formatNumber(obj.totalExp, "exp");
            if(obj.totalExp > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";           

            }
            else{
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";           

            }
        },
        displayPercentage: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expenesePercentageLabel);


            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + "%";
                }else{
                    current.textContent = "---";
                }
            });
        },
        displayMonth: function(){
            var now = new Date();
            var year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = year;
        },
        formatNumber: function(num, type){
            var numSplit, int , dec;
            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');

            int = numSplit[0];
            if(int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            dec = numSplit[1];

            

            return (type === "exp" ? '-' : '+') + ' ' + int + '.' + dec;
        },
        changeType: function(){
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription+ ',' +  DOMstrings.inputValue);
            nodeListForEach(fields, function(cur){
                cur.classList.toggle("red-focus");
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        }
    };


})();

var controller = (function(budgetCtrl, UICtrl){

    setupEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
    });
    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType);
    };

    var updateBudget = function(){
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    };
    var updatePercentages = function(){
        // Calculate percentages
        budgetCtrl.calculatePercentages();
        //Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        //Update UI
        UICtrl.displayPercentage(percentages);
    }
    var ctrlAddItem = function(){
        var input, newItem;
        input = UICtrl.getInput();
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event){
        var itemID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); 

            // Deleting from data structure
            budgetCtrl.deleteItem(type, ID);
            // Deleteing from UI
            UICtrl.deleteListItem(itemID);
            //Updating the budget post deletetion 
            updateBudget();
            //Updating percentages
            updatePercentages();
        }
    }

    return{
        init: function(){
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
        }
    }


})(budgetController, UIController);

controller.init();