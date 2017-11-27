# did not work as package.json script due to js regex weirdnesses
cd packages/apollo-modules-node
ncu -f "/(@orbiting.*|apollo-modules-node)/" -u -a

cd ../auth
ncu -f "/(@orbiting.*|apollo-modules-node)/" -u -a

cd ../base
ncu -f "/(@orbiting.*|apollo-modules-node)/" -u -a

cd ../documents
ncu -f "/(@orbiting.*|apollo-modules-node)/" -u -a

cd ../formats
ncu -f "/(@orbiting.*|apollo-modules-node)/" -u -a

cd ../mail
ncu -f "/(@orbiting.*|apollo-modules-node)/" -u -a

cd ../scalars
ncu -f "/(@orbiting.*|apollo-modules-node)/" -u -a

cd ../scripts
ncu -f "/(@orbiting.*|apollo-modules-node)/" -u -a

cd ../translate
ncu -f "/(@orbiting.*|apollo-modules-node)/" -u -a

cd ../../
