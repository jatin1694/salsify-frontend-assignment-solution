import React from "react";
import "./App.css";
import { datastore } from "./datastore";

let allPossibleOperator = datastore.getOperators();
allPossibleOperator = allPossibleOperator.map(operator => {
  operator.name = operator.text;
  return operator;
});

// creates a cinstant object of all products in the data store to perform filtering
const allProducts = datastore.getProducts()

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Indicates the index of the currently selected property
      selectedPropertyIndex: "-1",
      
      // Indicates the index of the currently selected operator
      selectedOperatorIndex: "-1",

      // Indicates the possible operators for currently selected property
      possibleOperator: [],

      // Indicates the selected values by the user for a given property and operator
      filterValue: ["-1"],

      // Indicates the visible dataset to the user
      visibleDataSet: allProducts,
    };
  }

  // Method to set the selected property in the state
  setProperty = event => {
    const value = event.target.value;
    this.setPossibleOperator(value);
  };


  // Method to set the possible operators in the state
  setPossibleOperator = selectedPropertyIndex => {
    const properties = datastore.getProperties();
    if (properties[selectedPropertyIndex].type === "string") {
      this.setState({
        ...this.state,
        possibleOperator: ["equals", "any", "none", "in", "contains"],
        selectedPropertyIndex
      });
    } else if (properties[selectedPropertyIndex].type === "number") {
      this.setState({
        ...this.state,
        possibleOperator: [
          "equals",
          "greater_than",
          "less_than",
          "any",
          "none",
          "in"
        ],
        selectedPropertyIndex
      });
    } else {
      this.setState({
        ...this.state,
        possibleOperator: [
          "equals",
          "any",
          "none",
          "in"
        ],
        selectedPropertyIndex
      });
    }
  };

  // Method to clear the form(all the set parameters) on pressing the clear button
  clearForm = () => {
    this.setState({
      ...this.state,
      selectedPropertyIndex: "-1",
      selectedOperatorIndex: "-1",
      filterValue: ["-1"],
      visibleDataSet: allProducts
    })
  }

  // Method to set the selected operator in the state
  setOperator = event => {
    const value = event.target.value;
    if(value === "any"){
      this.setState({
        ...this.state,
        selectedOperatorIndex:value
      }, () => this.filterHasAny());
    }
    else{
      this.setState({
        ...this.state,
        selectedOperatorIndex:value
      });
    }
  };

  // Method to set the filtered values in the state
  setValue = event => {
  if (event.target.multiple){
    const options = event.target.options
    let result = []
    for(let i = 0;i<options.length;i++){
      let opt = options[i];
      if(opt.selected){
        result.push(opt.value)
      }
    }

    this.setState({
      ...this.state,
      filterValue: result
    }, () => this.filterSet(result));

  }

  else{
    const value = event.target.value
    this.setState({
      ...this.state,
      filterValue: [value]
    }, () => this.filterSet([value]))
  }
  }


  // Method to filter the set based on selected properties and operators
  filterSet = (values) => {
    const {selectedPropertyIndex, selectedOperatorIndex} = this.state;
    const newDataDest = allProducts.filter(data => {
      const {property_values} = data;
      for(let i=0; i< property_values.length; i++) {
        if (selectedOperatorIndex === "equals"){
          if(property_values[i].property_id == selectedPropertyIndex && property_values[i].value == values[0]) {
            return true
          }
        }
        if(selectedOperatorIndex === "greater_than"){
          if(property_values[i].property_id == selectedPropertyIndex && property_values[i].value > values[0]) {
            return true
          }
        }
        if(selectedOperatorIndex === "less_than"){
          if(property_values[i].property_id == selectedPropertyIndex && property_values[i].value < values[0]) {
            return true
          }
        } 
        if(selectedOperatorIndex === "any"){
          if(property_values[i].property_id == selectedPropertyIndex) {
            return true
          }
        }
        if(selectedOperatorIndex === "none"){
          if(property_values[i].property_id == selectedPropertyIndex && property_values[i].value !== values[0]) {
            return true
          }
        }
        if(selectedOperatorIndex === "in"){
          if(property_values[i].property_id == selectedPropertyIndex && values.includes(property_values[i].value.toString())) {
            return true
          }
        }
        if(selectedOperatorIndex === "contains"){
          if(property_values[i].property_id == selectedPropertyIndex && property_values[i].value.toString().toLowerCase().includes(values[0].toLowerCase())) {
            return true
          }
        }
      }
      return false;
    });
    this.setState({
      ...this.state,
      visibleDataSet: newDataDest,
    });
  }
  
  // A standalone method to filter based on "Has Any" operator because it does not require a value
  filterHasAny = () => {
    const {selectedPropertyIndex} = this.state;
    const newDataDest = allProducts.filter(data => {
      const {property_values} = data;
      for(let i=0; i< property_values.length; i++) {
        if(property_values[i].property_id == selectedPropertyIndex) {
          return true
        }
      }
      return false;
    });
    this.setState({
      ...this.state,
      visibleDataSet: newDataDest,
    });
  }

  render() {
    const allProperties = datastore.getProperties();
    const {
      selectedPropertyIndex,
      possibleOperator,
      selectedOperatorIndex,
      visibleDataSet,
      filterValue
    } = this.state;

    // generates a list of all unique values based on their property
    // For eg. "Product Name" : ["Headphones", "Keys"]
    let valuesByProperty = {}
    allProducts.forEach(product => {
      product['property_values'].forEach(property => {
        if( property['property_id'] in valuesByProperty){
          if (!valuesByProperty[property['property_id']].includes(property['value'])){
            valuesByProperty[property['property_id']].push(property['value'])
          }
        }
        else{
          valuesByProperty[property['property_id']] = []
          valuesByProperty[property['property_id']].push(property['value'])
        } 
      })
    })

    // Filter out operators which are not possible for any particular Property.
    const possibleOperatorValue = allPossibleOperator.filter(operator => {
      return possibleOperator.includes(operator.id);
    });

    // Returns a table with dropdown menus for selecting property, operators, and values, and displays all the visible dataset
    return (
      <div className="App">
        <header className="App-header">
          <table className="table" id="items">
            <thead>
              <th>
              <DropDown
                values={allProperties}
                selectedIndex={selectedPropertyIndex}
                onChange={this.setProperty}
              />
              </th>
              <th>
              <DropDown
                  values={possibleOperatorValue}
                  selectedIndex={selectedOperatorIndex}
                  onChange={this.setOperator}
                />
              </th>

              {/* Generates the input for values based on selected operator */}
              
              <th>
                {selectedOperatorIndex !== "-1" ?
                <GetValues
                  onChange = {this.setValue}
                  selectedPropertyIndex = {selectedPropertyIndex}
                  selectedOperatorIndex = {selectedOperatorIndex}
                  valuesByProperty = {valuesByProperty}
                  filterValue = {filterValue}
                  allProperties = {allProperties}
                  filterHasAny = {this.filterHasAny}
                /> : ""}
              </th>
              <th>

              </th>
              <th>
                <button
                  id="clearButton"
                  onClick={this.clearForm}
                  value="hello"
                  >
                    Clear
                  </button>
              </th>
            </thead>
            <tbody>
              <tr>
              {
                allProperties.map((data) => {
                  return (
                    <td>
                      {data.name}
                    </td>
                  )
                })
              }
              </tr>
              {visibleDataSet.map((data) => {
                const {property_values} = data;
                const tds = [];
                for(let i = 0; i < allProperties.length; i++) {
                  if(i >= property_values.length) {
                    tds.push((
                      <td></td>
                    ))
                  } else {
                    tds.push((
                      <td>{property_values[i].value}</td>
                    ))
                  }
                }
                return (
                  <tr>
                    {tds}
                  </tr>
                )
              })
              }
            </tbody>
          </table>
        </header>
      </div>
    );
  }
}

// Generates input based on selected operator
// For eg, a dropdown for "Equals" operator, multiple dropdown for "Is Any" oeprator, a text input for "contains" operator
function GetValues(props) {
  const properties = datastore.getProperties();
  let isMultiple;
  const {onChange, selectedPropertyIndex, selectedOperatorIndex, valuesByProperty, filterValue} = props;
  if(selectedOperatorIndex === "any"){
    return(<p></p>)
  }

  if(selectedOperatorIndex === "contains"){
    return(
      <input type="text" onChange={onChange}/>
    )
  }

  if(selectedOperatorIndex === "in"){
    isMultiple = true
  }
  else{
    isMultiple = false
  }
  return (
    <DropDown
      values={valuesByProperty[selectedPropertyIndex]}
      selectedIndex={filterValue}
      onChange={onChange}
      isMultiple={isMultiple}
    />
  )
}

// A Method to create a dropdown menu with props for values, selected value, onchange function, and Multiple
function DropDown(props) {
  const { values, selectedIndex, onChange, isMultiple=false} = props;
  return (
    <select multiple={isMultiple}
      style={{ margin: "5px" }}
      value={selectedIndex}
      onChange={onChange}
    >
      <option value="-1" selected disabled>Select from below</option>
      {values.map(value => (
        <option value={value.id ?value.id : (value.id == 0? value.id: value)}>{value.name ? value.name : value}</option>
      ))}
    </select>
  );
}
export default App;
