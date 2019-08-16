import React from 'react'

import { storiesOf } from '@storybook/react'

import { Gallery } from '../src/components/Gallery'

const ArticleGallery = ({children}) => {
  const [show, setShow] = React.useState(false)

  return (
    
    <> { show &&
      <Gallery
        onClose={() => setShow(false)}
        startItemSrc='https://cdn.repub.ch/s3/republik-assets/github/republik/article-ostia/images/3f12ef23c87cfb5366e9b3a68a347b4c8a8c2b1f.jpeg'
        items={[
          {
            src: 'https://cdn.repub.ch/s3/republik-assets/github/republik/article-ostia/images/2a439daf257614378f27da8ffa397bc2d1f2d8f3.jpeg?size=3500x2333',
            author: 'Hans Muster',
            title:
              'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligulaeget dolor.',
          },
          {
            src: 'https://cdn.repub.ch/s3/republik-assets/github/republik/article-ostia/images/3f12ef23c87cfb5366e9b3a68a347b4c8a8c2b1f.jpeg?size=3322x2215',
            author: 'Hans Muster',
            title:
              'Donec quam felis, ultricies nec, pellentesqueeu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo,fringilla vel, aliquet nec, vulputate eget, arcu. ',
          },
        ]}
      />
    }
    <button onClick={() => setShow(true)}>Show Gallery</button>
    {children}
    </>
  )
}

storiesOf('Gallery', module).add('Gallery', () => 
  <ArticleGallery>
    <div>
      Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula
      eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient
      montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque
      eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo,
      fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut,
      imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.
      Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate
      eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac,
      enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus
      viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam
      ultricies nisi vel augue.
    </div>
    <div>
      Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula
      eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient
      montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque
      eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo,
      fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut,
      imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.
      Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate
      eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac,
      enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus
      viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam
      ultricies nisi vel augue.
    </div>
    <div>
      Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula
      eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient
      montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque
      eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo,
      fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut,
      imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.
      Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate
      eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac,
      enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus
      viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam
      ultricies nisi vel augue.
    </div>
    <div>
      Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula
      eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient
      montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque
      eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo,
      fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut,
      imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.
      Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate
      eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac,
      enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus
      viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam
      ultricies nisi vel augue.
    </div>
    <div>
      Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula
      eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient
      montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque
      eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo,
      fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut,
      imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.
      Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate
      eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac,
      enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus
      viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam
      ultricies nisi vel augue.
    </div>
    <div>
      Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula
      eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient
      montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque
      eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo,
      fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut,
      imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.
      Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate
      eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac,
      enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus
      viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam
      ultricies nisi vel augue.
    </div>
  </ArticleGallery>
)
