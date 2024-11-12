export function handleCheckboxesChange(position,checkedStates,setCheckedStates) {
    const updatedCheckedStates = checkedStates.map((item, index) => {
        return index === position ? !item : item
    });
    console.log(checkedStates,updatedCheckedStates);
    setCheckedStates(updatedCheckedStates);
}