QUnit.module('HexUtil - LinkedList')
QUnit.test( "Hex LinkedList - Create", function( assert ) {
	var list = new HexUtil.LinkedList();
	assert.equal(list.length, 0, "Initial size of a list should always be zero.");
});
QUnit.test( "Hex LinkedList - Push empty", function( assert ) {
	var list = new HexUtil.LinkedList();
	list.push(1);
	assert.notEqual(list.first, null, "Pushing item to empty list should put item as first element.");
	assert.notEqual(list.last , null, "Pushing item to empty list should put item as last element.");
	assert.equal(list.last, list.first, "First and last item should be the same.");
	assert.equal(list.first.data , 1, "Added element data should be 1.");

	assert.equal(list.length, 1, "Adding 1 element => length 1.");
});
QUnit.test( "Hex LinkedList - Push", function( assert ) {
	var list = new HexUtil.LinkedList();
	list.push(1);
	list.push(2);
	assert.notEqual(list.last , null, "There should be a last element in the list");
	assert.equal(list.first.next, list.last, "The successor of the first element should be the same as the last element.")
	assert.equal(list.last.data, 2, "Data of second element should be 2.")

	assert.equal(list.length, 2, "Adding 2 elements => length 2.");
});
QUnit.test( "Hex LinkedList - Pop", function( assert ) {
	var list = new HexUtil.LinkedList();
	list.push(1);
	list.push(2);
	
	var val2 = list.pop();
	assert.notEqual(list.first, null, "One element in list.");
	assert.notEqual(list.last , null, "One element in list.");
	assert.equal(list.last, list.first, "First and last item should be the same.");
	assert.equal(list.first.data, 1, "Remaining element data should be 1.");
	assert.equal(val2, 2, "Extracted element should be 2.");
	assert.equal(list.length, 1, "Popping 1 element => length 1.");

	var val1 = list.pop();
	assert.equal(list.first, null, "No element in list.");
	assert.equal(list.last , null, "No element in list.");
	assert.equal(val1, 1, "Extracted element should be 1.");
	assert.equal(list.length, 0, "Popping 2 elements => length 0.");

	assert.equal(list.length, 0, "Initial size of a list should always be zero.");
});

QUnit.test( "Hex LinkedList - Get", function( assert ) {
	var list = new HexUtil.LinkedList();
	list.push(1);
	list.push(2);	
	list.push(3);

	var val1 = list.get(0);
	var val2 = list.get(1);
	var val3 = list.get(2);

	assert.equal(val1, 1, "Extracted element should be 1.");
	assert.equal(val2, 2, "Extracted element should be 2.");
	assert.equal(val3, 3, "Extracted element should be 3.");

});

QUnit.test( "Hex LinkedList - Remove", function( assert ) {
	var list = new HexUtil.LinkedList();
	list.push(1);
	list.push(2);	
	list.push(3);

	var val2 = list.remove(1);
	assert.notEqual(list.first, null, "Two elements in list.");
	assert.notEqual(list.last , null, "Two elements in list.");

	assert.equal(val2, 2, "Extracted element should be 2.");
	assert.equal(list.length, 2, "Frist remove => length = 2");

	var val3 = list.remove(1);
	assert.notEqual(list.first, null, "One element in list.");
	assert.notEqual(list.last , null, "One element in list.");

	assert.equal(list.last, list.first, "First and last item should be the same.");

	assert.equal(val3, 3, "Extracted element should be 3.");
	assert.equal(list.length, 1, "Second remove => length = 1");

	var val1 = list.remove(0);
	assert.equal(list.first, null, "One element in list.");
	assert.equal(list.last , null, "One element in list.");

	assert.equal(val1, 1, "Extracted element should be 1.");
	assert.equal(list.length, 0, "Third remove => length = 0");
});



