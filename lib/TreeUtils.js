const { Seq, List } = require('immutable');

const exists = value => value !== null && typeof value !== 'undefined';
const NONE = undefined;

/**
 * @id TreeUtils
 * @lookup TreeUtils
 *
 *
 * ### *class* TreeUtils
 *
 * A collection of functional tree traversal helper functions for >ImmutableJS data structures.
 *
 * **Example**
 *
 * ```js
 * const treeUtils = new TreeUtils(Immutable.Seq.of('path', 'to', 'tree'));
 * ```
 *
 * **With custom key accessors**
 *
 * ```js
 * const treeUtils = new TreeUtils(Immutable.Seq.of('path', 'to', 'tree'), '__id', '__children');
 * ```
 *
 * **With custom *no result*-default**
 *
 * ```js
 * const treeUtils = new TreeUtils(Immutable.Seq.of('path', 'to', 'tree'), 'id', 'children', false);
 * ```
 *
 * **Note**
 * The first argument of every method of a `TreeUtils` object is the state you want to analyse. I won't mention / explain it again in method descriptions bellow. The argument `idOrKeyPath` also appears in most signatures, its purpose is thoroughly explained in the docs of >byArbitrary.
 *
 *
 * ###### Signature:
 * ```js
 * new TreeUtils(
 *    rootPath?: immutable.Seq,
 *    idKey?: string,
 *    childNodesKey?: string,
 *    nonValue?: any
 * )
 * ```
 *
 * ###### Arguments:
 * * `rootPath` - The path to the substate of your >ImmutableJS state that represents the root node of your tree. Default: `Immutable.Seq()`.
 * * `idKey` - The name of the key that points at unique identifiers of all nodes in your tree . Default: `'id'`.
 * * `childNodesKey` - The name of the key at which child nodes can be found. Default: `'childNodes'`.
 * * `noneValue` - The value that will get returned if a query doesn't return any results. Default: `undefined`.
 *
 * ###### Returns:
 * * A new `TreeUtils` object
 */
module.exports = class TreeUtils {

	constructor(rootPath = Seq(), idKey = 'id', childNodesKey = 'childNodes', none = NONE) {
		this.rootPath = rootPath;
		this.idKey = idKey;
		this.childNodesKey = childNodesKey;
		this.none = none;
	}

	/**
	 * @id TreeUtils-id
	 * @lookup id
	 *
	 * #### *method* id()
	 *
	 * Returns the id for the node at `keyPath`. Most useful when you want to get the id of the result of a previous tree query:
	 * ```js
	 * treeUtils.id(state, treeUtils.parent(state, 'node-3'));
	 * // 'node-1'
	 * ```
	 *
	 * ###### Signature:
	 * ```js
	 * id(
	 *    state: Immutable.Iterable,
	 *    keyPath: Immutable.Seq<string|number>
	 * ): string
	 * ```
	 *
	 * ###### Arguments:
	 * * `keyPath` - The absolute key path to the substate / node whose id you want to retrieve
	 *
	 * ###### Returns:
	 * The unique identifier of the node at the given key path.
	 *
	 */
	id(state, keyPath) {
		return state.getIn(keyPath.concat(this.idKey));
	}

	/**
	 * @id TreeUtils-nodes
	 * @lookup nodes
	 *
	 * #### *method* nodes()
	 *
	 * An iterator of all nodes in the tree.
	 *
	 * ```js
	 * for(var nodePath of treeUtils.nodes(state)) {
	 *    console.log(treeUtils.id(state, nodePath));
	 * }
	 * ```
	 *
	 * ###### Signature:
	 * ```
	 * nodes(
	 *     state: Immutable.Iterable,
	 *     path?: Immutable.Seq<string|number>
	 * ): Iterator
	 * ```
	 *
	 * ###### Arguments:
	 * * `path` - The key path that points at the root of the (sub)tree whose descendants you want to iterate. Default: The `TreeUtils` object's `rootPath`.
	 *
	 * ###### Returns:
	 * An **unordered** [Iterator](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Iteration_protocols) of all nodes in the tree.
	 */
	* nodes(state, path) {
		let stack = List.of(path || this.rootPath);
		while (stack.size > 0) {
			const keyPath = stack.first();
			yield keyPath;

			stack = stack.shift();

			const item = state.getIn(keyPath);
			const childNodes = item.get(this.childNodesKey);
			if (childNodes && childNodes.size > 0) {
				for (const i of item.get(this.childNodesKey).keys()) {
					stack = stack.push(keyPath.concat(this.childNodesKey, i));
				}
			}
		}
	}

	/**
	 * @id TreeUtils-find
	 * @lookup find
	 *
	 * #### *method* find()
	 *
	 * Returns the key path to the first node for which `compatator` returns `true`. Uses >nodes internally and as >nodes is an **unordered** Iterator, you should probably use this to find unique occurences of data.
	 * ```js
	 * treeUtils.find(state, node => node.get('name') === 'Me in Paris');
	 * // Seq ["childNodes", 0, "childNodes", 0]
	 * ```
	 *
	 * ###### Signature:
	 * ```js
	 * find(
	 *    state: Immutable.Iterable,
	 *    comparator: (
	 *         node: Immutable.Iterable,
	 *         keyPath: Immutable.Seq<string|number>
	 *     ): boolean,
	 *    path?: Immutable.Seq<string|number>
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Arguments:
	 * * `comparator` - A function that gets passed a `node` and its `keyPath` and should return whether it fits the criteria or not.
	 * * `path?` - An optional key path to the (sub)state you want to analyse: Default: The `TreeUtils` object's `rootPath`.
	 *
	 * ###### Returns:
	 * The key path to the first node for which `comparator` returned `true`.
	 */
	find(state, comparator, path) {
		for (const keyPath of this.nodes(state, path)) {
			if (comparator(state.getIn(keyPath), keyPath) === true) {
				return keyPath;
			}
		}
		return this.none;
	}
	/**
	 * @id TreeUtils-filter
	 * @lookup filter
	 *
	 * #### *method* filter()
	 *
	 * Returns an >Immutable.List of key paths pointing at the nodes for which `comparator` returned `true`.
	 * ```js
	 * treeUtils.filter(state, node => node.get('type') === 'folder');
	 * //List [ Seq[], Seq["childNodes", 0], Seq["childNodes", 1] ]
	 * ```
	 *
	 * ###### Signature:
	 * ```js
	 * filter(
	 *     state: Immutable.Iterable,
	 *     comparator: (
	 *         node: Immutable.Iterable,
	 *         keyPath: Immutable.Seq<string|number>
	 *     ): boolean,
	 *     path?: Immutable.Seq<string|number>
	 * ): List<Immutable.Seq<string|number>>
	 * ```
	 *
	 * ###### Arguments:
	 * * `comparator` - A function that gets passed a `node` and its `keyPath` and should return whether it fits the criteria or not.
	 * * `path?` - An optional key path to the (sub)state you want to analyse: Default: The `TreeUtils` object's `rootPath`.
	 *
	 *
	 * ###### Returns:
	 * A >Immutable.List of all the key paths that point at nodes for which `comparator` returned `true`.
	 */
	filter(state, comparator, path) {
		let result = List();
		for (const keyPath of this.nodes(state, path)) {
			if (comparator(state.getIn(keyPath), keyPath) === true) {
				result = result.push(keyPath);
			}
		}
		return result;
	}

	/**
	 * @id TreeUtils-byId
	 * @lookup byId
	 *
	 * #### *method* byId()
	 *
	 * Returns the key path to the node with id === `id`.
	 *
	 * ###### Signature:
	 * ```js
	 * id(
	 *    state: Immutable.Iterable,
	 *    id: string
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Arguments:
	 * * `id` - A unique identifier
	 *
	 * ###### Returns:
	 * The key path to the node with id === `id`.
	 */
	byId(state, id) {
		return this.find(state, item => item.get(this.idKey) === id);
	}

	/**
	 * @id TreeUtils-byArbitrary
	 * @lookup byArbitrary
	 *
	 * #### *method* byArbitrary()
	 *
	 * Returns `idOrKeyPath` if it is a >Immutable.Seq, else returns the result of >byId for `idOrKeyPath`. This is used in all other functions that work on a unique identifiers in order to reduce the number of lookup operations.
	 *
	 * ###### Signature:
	 * ```js
	 * byArbitrary(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>
	 * ): Immutable.Seq<string|number>
	 * ```
	 * ###### Returns:
	 * The key path pointing at the node found for id === `idOrKeyPath` or, if is a >Immutable.Seq, the `idOrKeyPath` itself.
	 *
	 */
	byArbitrary(state, idOrKeyPath) {
		return Seq.isSeq(idOrKeyPath)
			? idOrKeyPath
			: this.byId(state, idOrKeyPath);
	}

	/**
	 * @id TreeUtils-nextSibling
	 * @lookup nextSibling
	 *
	 * #### *method* nextSibling()
	 *
	 * ###### Signature:
	 * ```js
	 * nextSibling(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Returns:
	 * Returns the next sibling node of the node at `idOrKeyPath`
	 */
	nextSibling(state, idOrKeyPath) {
		const keyPath = this.byArbitrary(state, idOrKeyPath);
		const index = Number(keyPath.last());
		const nextSiblingPath = keyPath.skipLast(1).concat(index + 1);
		if (state.hasIn(nextSiblingPath)) {
			return nextSiblingPath;
		}
		return this.none;
	}

	/**
	 * @id TreeUtils-previousSibling
	 * @lookup previousSibling
	 *
	 * #### *method* previousSibling()
	 *
	 * ###### Signature:
	 * ```js
	 * previousSibling(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Returns:
	 * Returns the previous sibling node of the node at `idOrKeyPath`
	 */
	previousSibling(state, idOrKeyPath) {
		const keyPath = this.byArbitrary(state, idOrKeyPath);
		const index = Number(keyPath.last());
		if (index > 0) {
			return keyPath.skipLast(1).concat(index - 1);
		}
		return this.none;
	}

	/**
	 * @id TreeUtils-firstChild
	 * @lookup firstChild
	 *
	 * #### *method* firstChild()
	 *
	 * ###### Signature:
	 * ```js
	 * firstChild(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Returns:
	 * Returns the first child node of the node at `idOrKeyPath`
	 */
	firstChild(state, idOrKeyPath) {
		const keyPath = this
			.byArbitrary(state, idOrKeyPath)
			.concat([this.childNodesKey, 0]);
		if (state.hasIn(keyPath)) {
			return keyPath;
		}
		return this.none;
	}

	/**
	 * @id TreeUtils-lastChild
	 * @lookup lastChild
	 *
	 * #### *method* lastChild()
	 *
	 * ###### Signature:
	 * ```js
	 * lastChild(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Returns:
	 * Returns the last child node of the node at `idOrKeyPath`
	 */
	lastChild(state, idOrKeyPath) {
		const keyPath = this
			.byArbitrary(state, idOrKeyPath)
			.concat([this.childNodesKey]);
		const item = state.getIn(keyPath);
		if (item && item.size > 0) {
			return keyPath.concat([item.size - 1]);
		}
		return this.none;
	}

	/**
	 * @id TreeUtils-siblings
	 * @lookup siblings
	 *
	 * #### *method* siblings()
	 *
	 * ###### Signature:
	 * ```js
	 * siblings(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>
	 * ): Immutable.List<Immutable.Seq<string|number>>
	 * ```
	 *
	 * ###### Returns:
	 * Returns a >Immutable.List of key paths pointing at the sibling nodes of the node at `idOrKeyPath`
	 */
	siblings(state, idOrKeyPath) {
		const keyPath = this.byArbitrary(state, idOrKeyPath);
		const index = Number(keyPath.last());
		const parentChildren = keyPath.skipLast(1);
		const item = state.getIn(parentChildren);
		if (exists(item)) {
			let result = List();
			for (const i of item.keys()) {
				if (i !== index) {
					result = result.push(parentChildren.concat(i));
				}
			}
			return result;
		}
		return this.none;
	}

	/**
	 * @id TreeUtils-childNodes
	 * @lookup childNodes
	 *
	 * #### *method* childNodes()
	 *
	 * ###### Signature:
	 * ```js
	 * childNodes(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>
	 * ): Immutable.List<Immutable.Seq<string|number>>
	 * ```
	 *
	 * ###### Returns:
	 * Returns a >Immutable.List of all child nodes of the node at `idOrKeyPath`
	 */
	childNodes(state, idOrKeyPath) {
		const keyPath = this
			.byArbitrary(state, idOrKeyPath)
			.concat(this.childNodesKey);
		const item = state.getIn(keyPath);
		if (exists(item)) {
			const l = item.size;
			let result = List();
			for (let i = 0; i < l; i += 1) {
				result = result.push(keyPath.concat(i));
			}
			return result;
		}
		return this.none;
	}

	/**
	 * @id TreeUtils-childAt
	 * @lookup childNodes
	 *
	 * #### *method* childAt()
	 *
	 * ###### Signature:
	 * ```js
	 * childAt(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>,
	 *    index: number
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Returns:
	 * Returns the child node at position of `index` of the node at `idOrKeyPath`
	 */
	childAt(state, idOrKeyPath, index) {
		const keyPath = this
			.byArbitrary(state, idOrKeyPath)
			.concat(this.childNodesKey, index);
		if (state.hasIn(keyPath)) {
			return keyPath;
		}
		return this.none;
	}

	/**
	 * @id TreeUtils-descendants
	 * @lookup descendants
	 *
	 * #### *method* descendants()
	 *
	 * ###### Signature:
	 * ```js
	 * descendants(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>,
	 * ): Immutable.List<Immutable.Seq<string|number>>
	 * ```
	 *
	 * ###### Returns:
	 * Returns a list of key paths pointing at all descendants of the node at `idOrKeyPath`
	 */
	descendants(state, idOrKeyPath) {
		const keyPath = this.byArbitrary(state, idOrKeyPath);
		return this.filter(state, (item) => {
			return item.get(this.idKey) !== this.id(state, keyPath);
		}, keyPath);
	}

	/**
	 * @id TreeUtils-childIndex
	 * @lookup childIndex
	 *
	 * #### *method* childIndex()
	 *
	 * ###### Signature:
	 * ```js
	 * childIndex(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>,
	 * ): number
	 * ```
	 *
	 * ###### Returns:
	 * Returns the index at which the node at `idOrKeyPath` is positioned in its parent child nodes list.
	 */
	childIndex(state, idOrKeyPath) {
		return Number(this.byArbitrary(state, idOrKeyPath).last());
	}

	/**
	 * @id TreeUtils-hasChildNodes
	 * @lookup hasChildNodes
	 *
	 * #### *method* hasChildNodes()
	 *
	 * ###### Signature:
	 * ```js
	 * hasChildNodes(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>,
	 * ): boolean
	 * ```
	 *
	 * ###### Returns:
	 * Returns whether the node at `idOrKeyPath` has children.
	 */
	hasChildNodes(state, idOrKeyPath) {
		const keyPath = this
			.byArbitrary(state, idOrKeyPath)
			.concat(this.childNodesKey);
		const item = state.getIn(keyPath);
		return exists(item) && item.size > 0;
	}

	/**
	 * @id TreeUtils-numChildNodes
	 * @lookup numChildNodes
	 *
	 * #### *method* numChildNodes()
	 *
	 * ###### Signature:
	 * ```js
	 * numChildNodes(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>,
	 * ): number
	 * ```
	 *
	 * ###### Returns:
	 * Returns the number of child nodes the node at `idOrKeyPath` has.
	 */
	numChildNodes(state, idOrKeyPath) {
		const keyPath = this
			.byArbitrary(state, idOrKeyPath)
			.concat(this.childNodesKey);
		const item = state.getIn(keyPath);
		return exists(item) ? item.size : 0;
	}

	/**
	 * @id TreeUtils-parent
	 * @lookup parent
	 *
	 * #### *method* parent()
	 *
	 * ###### Signature:
	 * ```js
	 * parent(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>,
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Returns:
	 * Returns the key path to the parent of the node at `idOrKeyPath`.
	 */
	parent(state, idOrKeyPath) {
		const keyPath = this.byArbitrary(state, idOrKeyPath);
		if (keyPath && keyPath.size) {
			return keyPath.slice(0, -2);
		}
		return this.none;
	}

	/**
	 * @id TreeUtils-ancestors
	 * @lookup ancestors
	 *
	 * #### *method* ancestors()
	 *
	 * ###### Signature:
	 * ```js
	 * ancestors(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>,
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Returns:
	 * Returns an >Immutable.List of all key paths that point at direct ancestors of the node at `idOrKeyPath`.
	 */
	ancestors(state, idOrKeyPath) {
		return this
			.byArbitrary(state, idOrKeyPath)
			.reduceRight((memo, value, index, keyPath) => {
				if (
					(index - this.rootPath.size) % 2 === 0
					&& index >= this.rootPath.size
				) {
					return memo.push(keyPath.takeLast(index).reverse().toSetSeq());
				}
				return memo;
			}, List());
	}

	/**
	 * @id TreeUtils-position
	 * @lookup position
	 *
	 * #### *method* position()
	 *
	 * This method is a very naive attempt to calculate a unqiue numeric position descriptor that can be used to compare two nodes for their absolute position in the tree.
	 * ```js
	 * treeUtils.position(state, 'node-4') > treeUtils.position(state, 'node-3');
	 * // true
	 * ```
	 *
	 * Please note that `position` should not get used to do any comparison with the root node.
	 *
	 * ###### Signature:
	 * ```js
	 * position(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>,
	 * ): number
	 * ```
	 *
	 * ###### Returns:
	 * Returns a unique numeric value that represents the absolute position of the node at `idOrKeyPath`.
	 */
	position(state, idOrKeyPath) {
		const order = this
			.byArbitrary(state, idOrKeyPath)
			.reduceRight((memo, value, index) => {
				if (index >= this.rootPath.size && index % 2 === 0) {
					return value.toString() + memo;
				}
				return memo;
			}, '');
		return Number(`1.${order}`);
	}

	/**
	 * @id TreeUtils-right
	 * @lookup right
	 *
	 * #### *method* right()
	 *
	 * Returns the key path to the next node to the right. The next right node is either:
	 * * The first child node.
	 * * The next sibling.
	 * * The next sibling of the first ancestor that in fact has a next sibling.
	 * * undefined
	 *
	 * ```js
	 * let nodePath = treeUtils.byId(state, 'root');
	 * while (nodePath) {
	 *    console.log(nodePath);
	 *    nodePath = treeUtils.right(state, nodePath);
	 * }
	 * // 'root'
	 * // 'node-1'
	 * // 'node-2'
	 * // 'node-3'
	 * // 'node-4'
	 * // 'node-5'
	 * // 'node-6'
	 * ```
	 *
	 * ###### Signature:
	 * ```js
	 * right(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>,
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Returns:
	 * Returns the key path to the node to the right of the one at `idOrKeyPath`.
	 */
	right(state, idOrKeyPath) {
		const l = this.rootPath.size;
		const keyPath = this.byArbitrary(state, idOrKeyPath);
		const firstChild = this.firstChild(state, keyPath);

		if (firstChild) {
			return firstChild;
		}

		const nextSibling = this.nextSibling(state, keyPath);
		if (nextSibling) {
			return nextSibling;
		}

		let parent = this.parent(state, keyPath);
		let nextSiblingOfParent;

		while (parent && parent.size >= l) {
			nextSiblingOfParent = this.nextSibling(state, parent);
			if (nextSiblingOfParent) {
				return nextSiblingOfParent;
			}
			parent = this.parent(state, parent);
		}
		return this.none;
	}

	/**
	 * @id TreeUtils-left
	 * @lookup left
	 *
	 * #### *method* left()
	 *
	 * Returns the key path to the next node to the left. The next left node is either:
	 * * The last descendant of the previous sibling node.
	 * * The previous sibling node.
	 * * The parent node.
	 * * undefined
	 *
	 * ```js
	 * let nodePath = treeUtils.lastDescendant(state, 'root');
	 * while (nodePath) {
	 *    console.log(nodePath);
	 *    nodePath = treeUtils.left(state, nodePath);
	 * }
	 * // 'node-6'
	 * // 'node-5'
	 * // 'node-4'
	 * // 'node-3'
	 * // 'node-2'
	 * // 'node-1'
	 * // 'root'
	 * ```
	 *
	 *
	 * ###### Signature:
	 * ```js
	 * left(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>,
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Returns:
	 * Returns the key path to the node to the right of the one at `idOrKeyPath`.
	 */
	left(state, idOrKeyPath) {
		const keyPath = this.byArbitrary(state, idOrKeyPath);
		let lastChild = this.previousSibling(state, keyPath);

		while (lastChild) {
			if (!this.hasChildNodes(state, lastChild)) {
				return lastChild;
			}
			lastChild = this.lastChild(state, lastChild);
		}

		const parent = this.parent(state, keyPath);

		if (parent && parent.size >= this.rootPath.size) {
			return parent;
		}

		return this.none;
	}

	/**
	 * @id TreeUtils-firstDescendant
	 * @lookup firstDescendant
	 *
	 * #### *method* firstDescendant()
	 *
	 * Alias of >firstChild.
	 */
	firstDescendant(state, idOrKeyPath) {
		return this.firstChild(state, idOrKeyPath);
	}

	/**
	 * @id TreeUtils-lastDescendant
	 * @lookup lastDescendant
	 *
	 * #### *method* lastDescendant()
	 *
	 * Returns the key path to the most right node in the given subtree (keypath). The last child of the most deep descendant, if that makes any sense. Look at the example:
	 *
	 * ```js
	 * treeUtils.lastDescendant(state, 'root');
	 * // 'node-6'
	 * ```
	 *
	 * ###### Signature:
	 * ```js
	 * lastDescendant(
	 *    state: Immutable.Iterable,
	 *    idOrKeyPath: string|Immutable.Seq<string|number>,
	 * ): Immutable.Seq<string|number>
	 * ```
	 *
	 * ###### Returns:
	 * Returns the key path to the last descendant of the node at `idOrKeyPath`.
	 */
	lastDescendant(state, idOrKeyPath) {
		let keyPath = this.lastChild(state, idOrKeyPath);
		while (keyPath && this.hasChildNodes(state, keyPath)) {
			keyPath = this.lastChild(state, keyPath);
		}
		return keyPath;
	}
}
