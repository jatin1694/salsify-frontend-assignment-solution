import React from "react";
import "./App.css";
import { datastore } from "./datastore";

let allPossibleOperator = datastore.getOperators();
allPossibleOperator = allPossibleOperator.map(operator => {
  operator.name = operator.text;
  return operator;
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPropertyIndex: "-1",
      selectedOperatorIndex: "-1",
      selectedOperator: "",
      selectedValue: "",
      possibleOperator: [],
      filterValue: '',
      fullDataSet: datastore.getProducts(),
    };
  }

  setProperty = event => {
    const value = event.target.value;
    this.setPossibleOperator(value);
  };

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
          "any",
          "none",
          "in"
        ],
        selectedPropertyIndex
      });
    }
  };

  setOperator = event => {
    const value = event.target.value;
    this.setState({
      ...this.state,
      selectedOperatorIndex:value
    });
    console.log({value})
  };

  filterSet = (event) => {
    const {selectedOperatorIndex, filterValue} = this.state;
    let value = filterValue;
    if(event) {
      value = event.target.value;
    }
    if(selectedOperatorIndex==="equals"){
      this.filterEquals(value);
    }
  }

  filterEquals = (value) => {
    const {selectedPropertyIndex} = this.state;
    console.log({selectedPropertyIndex});
    console.log({value});
    const fullDataSet = datastore.getProducts();
    const newDataDest = fullDataSet.filter(data => {
      const {property_values} = data;
      for(let i=0; i< property_values.length; i++) {
        if(property_values[i].property_id == selectedPropertyIndex && property_values[i].value == value) {
          return true
        }
      }
      return false;
    });
    this.setState({
      ...this.state,
      fullDataSet: newDataDest,
      filterValue:value
    });
  }

  render() {
    const allProperties = datastore.getProperties();
    const {
      selectedPropertyIndex,
      possibleOperator,
      selectedOperatorIndex,
      fullDataSet
    } = this.state;
    console.log({fullDataSet});
    const possibleOperatorValue = allPossibleOperator.filter(operator => {
      return possibleOperator.includes(operator.id);
    });
    console.log({ selectedOperatorIndex });
    return (
      <div className="App">
        <header className="App-header">
          <table className="table">
            <thead>
              <DropDown
                values={allProperties}
                selectedIndex={selectedPropertyIndex}
                onChange={this.setProperty}
              />
              {selectedPropertyIndex !== "-1" ? (
                <DropDown
                  values={possibleOperatorValue}
                  selectedIndex={selectedOperatorIndex}
                  onChange={this.setOperator}
                />
              ) : (
                ""
              )}
              {selectedOperatorIndex !== "-1" ?
              <input type="text" onChange={this.filterSet}/>: ""}
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
              {fullDataSet.map((data) => {
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

function DropDown(props) {
  const { values, selectedIndex, onChange, isMultiple=false } = props;
  return (
    <select multiple={isMultiple}
      style={{ margin: "5px" }}
      value={selectedIndex}
      onChange={onChange}
    >
      <option value="-1" selected disabled>Select one from below</option>
      {values.map(value => (
        <option value={value.id}>{value.name}</option>
      ))}
    </select>
  );
}
export default App;
