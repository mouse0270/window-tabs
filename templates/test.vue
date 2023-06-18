<main>
	<h1>{{title}}</h1>
	<p>{{content}}</p>
	<ul>
		<li v-for="(item, index) in items" :key="index">{{item}}</li>
	</ul>
</main>